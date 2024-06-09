import { CommonResponseDto } from '@/common/common.dtos';
import { PRODUCTION } from '@/common/constants.common';
import {
  CustomBadRequest,
  CustomConflictException,
  CustomForbiddenException,
  CustomInternalServerErrorException,
  CustomNotFoundException,
  CustomUnauthorizedException,
} from '@/common/exception/custom.exception';
import { UUID_REGEX_FROM_ORDERS_URL } from '@/common/utils/regex.utils';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { decodeToken } from '@/common/utils/token.utils';
import { ConfigService } from '@/config/config.service';
import {
  API_URL,
  APP_MAILING_ADDRESS,
  NODE_ENV,
  PLATFORM_COMMISSION_IN_PERCENTAGE,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} from '@/config/config.utils';
import { MailService } from '@/mail/mail.service';
import { Order } from '@/order/entities/order.entity';
import { orderStatuses, paymentStatuses } from '@/order/order.constants';
import { OrderService } from '@/order/order.service';
import { prepareOrderSuccessPaymentEmailBody } from '@/order/order.utils';
import { PayoutService } from '@/payout/payout.service';
import { User } from '@/user/entities/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { DataSource } from 'typeorm';
import { StripProductLineDto } from './stripe.dto';
import { getNewStripeAccountOnboardingUrl } from '@/user/user.utils';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(
    private readonly config: ConfigService,
    private readonly orderService: OrderService,
    private readonly mailService: MailService,
    private readonly payoutService: PayoutService,
    private readonly dataSource: DataSource,
  ) {
    this.stripe = new Stripe(this.config.get<string>(STRIPE_SECRET_KEY), {
      apiVersion: '2024-04-10',
    });
  }

  async createExpressAccount(seller: User): Promise<string> {
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: seller.email,
    });
    return account.id;
  }

  async createExpressAccountLink(seller: User): Promise<string> {
    if (!seller || !seller.stripeAccountId) {
      throw new CustomBadRequest({
        messages: ['Seller not found or Stripe account ID not set'],
      });
    }
    const accountLink = await this.stripe.accountLinks.create({
      account: seller.stripeAccountId,
      type: 'account_onboarding',
      refresh_url: getNewStripeAccountOnboardingUrl(seller),
      return_url: `${this.config.get<string>(API_URL)}/orders/users/${seller.id}/stripe-express-account-onboarding-success`,
    });
    return accountLink.url;
  }

  async createCheckoutSession(
    orderId: string,
    successUrl: string,
    cancelUrl: string,
    token: string,
  ): Promise<Stripe.Checkout.Session | CommonResponseDto> {
    if (!token) throw new CustomUnauthorizedException();
    let user: User;
    try {
      user = decodeToken(token);
      if (!user) {
        throw new CustomUnauthorizedException({
          messages: ["Invalid token, we couldn't process your payment"],
        });
      }
    } catch (err) {
      this.logError(err);
      throw new CustomUnauthorizedException();
    }
    const { data: order } = (await this.orderService.findById(orderId)) ?? {};
    if (!order) {
      throw new CustomNotFoundException({ messages: ['Order Not Found'] });
    }
    if (order.buyer.id !== user.id) {
      throw new CustomForbiddenException({
        messages: ['Order does not belong to you!'],
      });
    }
    if (order.paymentStatus === paymentStatuses.PAID) {
      throw new CustomConflictException({
        messages: ['You have already paid for this order'],
      });
    }
    const products: StripProductLineDto[] = order.orderItems.map(
      (currItem) => ({
        name: `${currItem.inventory.product.name} #${currItem.inventory.product.code}`,
        amount: currItem.inventory.product.unitPrice,
        currency: order.buyer.currency,
        quantity: currItem.quantity,
      }),
    );

    const lineItems = products.map((product) => ({
      price_data: {
        currency: product.currency,
        product_data: {
          name: product.name,
        },
        unit_amount: product.amount,
      },
      quantity: product.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  }

  async handleSuccessfulStripePayment(): Promise<CommonResponseDto> {
    return {
      status: statusCodes.OK,
      message: `${statusMessages.OK}: Payment success received, check your email for your order status updates. Thank you for shopping with us!`,
    };
  }

  async handleSuccessfulStripeExpressAccountOnboarding(): Promise<CommonResponseDto> {
    return {
      status: statusCodes.OK,
      message: `${statusMessages.OK}: Your Stripe Express Account has been successfully onboard. You will be able to receive payments from Awesome Market!`,
    };
  }

  async handleCancelledStripePayment(): Promise<CommonResponseDto> {
    return {
      status: statusCodes.OK,
      message: `${statusMessages.OK}: We will communicate further steps via your email`,
    };
  }

  async handleStripeWebhook(
    signature: string,
    body: Buffer,
  ): Promise<CommonResponseDto> {
    const endpointSecret = this.config.get<string>(STRIPE_WEBHOOK_SECRET);
    let event: Stripe.Event;
    try {
      event = this.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      this.logError(err);
      throw new CustomBadRequest({
        messages: [`Webhook Error: ${err.message}`],
      });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    switch (event.type) {
      case 'checkout.session.completed':
        return await this.handleCheckoutSessionCompleted(session);
      case 'checkout.session.async_payment_failed':
        return await this.handleCheckoutSessionFailed(session);
      default:
        this.logError(`Unhandled event type ${event.type}`);
        throw new CustomBadRequest();
    }
  }
  private constructEvent(
    payload: Buffer,
    sig: string,
    secret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, sig, secret);
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<CommonResponseDto> {
    const orderId = this.extractOrderId(session.success_url);
    if (!orderId) {
      throw new CustomBadRequest({
        messages: [
          `${statusMessages.BAD_REQUEST}: Missing order id from the success url`,
        ],
      });
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.findOrderById(orderId);
      const { data: updatedOrder } =
        (await this.orderService.update(
          orderId,
          {
            status: orderStatuses.PROCESSING,
            paymentStatus: paymentStatuses.PAID,
          },
          order.buyer,
          queryRunner,
        )) ?? {};
      for (const currOrderItem of order.orderItems) {
        const platformCommissionInPercentage = this.config.get<number>(
          PLATFORM_COMMISSION_IN_PERCENTAGE,
        );
        const productCost =
          currOrderItem.quantity * currOrderItem.inventory.product.unitPrice;
        const amountToPayToSeller =
          productCost - (productCost * platformCommissionInPercentage) / 100;
        await this.payoutService.create(
          {
            seller: currOrderItem.inventory.owner,
            amount: amountToPayToSeller,
            order: order,
          },
          queryRunner,
        );
      }
      await queryRunner.commitTransaction();
      if (!!updatedOrder) {
        const { html, text } = prepareOrderSuccessPaymentEmailBody({ order });
        await this.mailService.sendEmail({
          fromEmailAddress: this.config.get<string>(APP_MAILING_ADDRESS),
          personalizations: [{ to: { email: order.buyer.email } }],
          emailSubject: `Your Payment Was Successful! Order - #${order.code} Now Processing`,
          emailHtmlBody: html,
          emailTextBody: text,
        });
        return { status: statusCodes.OK, message: statusMessages.OK };
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logError(err);
      throw new CustomInternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  private async handleCheckoutSessionFailed(
    session: Stripe.Checkout.Session,
  ): Promise<CommonResponseDto> {
    const orderId = this.extractOrderId(session.cancel_url);
    if (!orderId) {
      throw new CustomBadRequest({
        messages: [
          `${statusMessages.BAD_REQUEST}: Missing order id from the cancel url`,
        ],
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.findOrderById(orderId);
      await this.orderService.update(
        orderId,
        { paymentStatus: paymentStatuses.FAILED },
        order.buyer,
        queryRunner,
      );
      return { status: statusCodes.OK, message: statusMessages.OK };
    } catch (err) {
      this.logError(err);
      throw new CustomInternalServerErrorException();
    }
  }

  private extractOrderId(url: string): string | null {
    const match = url.match(UUID_REGEX_FROM_ORDERS_URL);
    return match?.length ? match[1] : null;
  }

  private async findOrderById(orderId: string): Promise<Order> {
    const { data: order } = (await this.orderService.findById(orderId)) ?? {};
    if (!order) {
      throw new CustomNotFoundException({
        messages: [`${statusMessages.NOT_FOUND}: Order not found!`],
      });
    }
    return order;
  }
  private logError(err: any): void {
    if (this.config.get<string>(NODE_ENV) !== PRODUCTION && err) {
      Logger.error(err);
    }
  }
}
