import { ConfigService } from '@/config/config.service';
import {
  APP_MAILING_ADDRESS,
  NODE_ENV,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} from '@/config/config.utils';
import { OrderService } from '@/order/order.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { StripProductLineDto } from './stripe.dto';
import { CommonResponseDto } from '@/common/common.dtos';
import { statusCodes, statusNames } from '@/common/utils/status.utils';
import { Response } from 'express';
import { UUID_REGEX_FROM_ORDERS_URL } from '@/common/utils/regex.utils';
import { PRODUCTION } from '@/common/constants.common';
import { orderStatuses, paymentStatuses } from '@/order/order.constants';
import { MailService } from '@/mail/mail.service';
import { prepareOrderSuccessPaymentEmailBody } from '@/order/order.utils';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(
    private readonly config: ConfigService,
    private readonly orderService: OrderService,
    private readonly mailService: MailService,
  ) {
    this.stripe = new Stripe(this.config.get<string>(STRIPE_SECRET_KEY), {
      apiVersion: '2024-04-10',
    });
  }

  async createCheckoutSession(
    orderId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    const order = (await this.orderService.findById(orderId))?.data;
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const products: StripProductLineDto[] = order.orderItems.map(
      (currItem) => ({
        name: currItem.inventory.product.name,
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
      message: `${statusNames.OK}: Payment success received, check your email for your order status updates. Thank you for shopping with us!`,
    };
  }

  async handleCancelledStripePayment(): Promise<CommonResponseDto> {
    return {
      status: statusCodes.OK,
      message: `${statusNames.OK}: We will communicate further steps via your email`,
    };
  }

  async handleStripeWebhook(
    signature: any,
    body: Buffer,
    res: Response,
  ): Promise<Response> {
    const endpointSecret = this.config.get<string>(STRIPE_WEBHOOK_SECRET);
    let event: Stripe.Event;
    try {
      event = this.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      Logger.error(`Webhook signature verification failed.`, err.message);
      return res
        .status(statusCodes.BAD_REQUEST)
        .send(`Webhook Error: ${err.message}`);
    }

    const session = event.data.object as Stripe.Checkout.Session;
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(session, res);
        break;
      case 'checkout.session.async_payment_failed':
        await this.handleCheckoutSessionFailed(session, res);
        break;
      default:
        Logger.error(`Unhandled event type ${event.type}`);
    }
  }
  private constructEvent(
    payload: Buffer,
    sig: string | string[],
    secret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, sig, secret);
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
    res: Response,
  ) {
    const match = session.success_url.match(UUID_REGEX_FROM_ORDERS_URL);
    if (!!match?.length) {
      const orderId = match[1];
      const order = (await this.orderService.findById(orderId))?.data;
      if (!order) {
        return res
          .status(statusCodes.NOT_FOUND)
          .send(`${statusNames.NOT_FOUND}: Order not found!`);
      }
      try {
        const updatedOrder = await this.orderService.update(
          orderId,
          {
            status: orderStatuses.PROCESSING,
            paymentStatus: paymentStatuses.PAID,
          },
          order.buyer,
        );
        if (!!updatedOrder) {
          const { html, text } = prepareOrderSuccessPaymentEmailBody({ order });
          await this.mailService.sendEmail({
            fromEmailAddress: this.config.get<string>(APP_MAILING_ADDRESS),
            personalizations: [{ to: { email: order.buyer.email } }],
            emailSubject: `Your Payment Was Successful! Order - #${order.code} Now Processing`,
            emailHtmlBody: html,
            emailTextBody: text,
          });
          return res.status(statusCodes.OK).send(statusNames.OK);
        }
      } catch (err) {
        if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
          Logger.error(err);
        }
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send(statusNames.INTERNAL_SERVER_ERROR);
    } else {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.error(
          'There was no order id from the success url sent from stripe',
        );
      }
      return res
        .status(statusCodes.BAD_REQUEST)
        .send(
          `${statusNames.BAD_REQUEST}: Missing order id from the success url`,
        );
    }
  }

  private async handleCheckoutSessionFailed(
    session: Stripe.Checkout.Session,
    res: Response,
  ) {
    console.log('Checkout Session Completed: ', session);
    const match = session.success_url.match(UUID_REGEX_FROM_ORDERS_URL);
    if (!!match?.length) {
      const orderId = match[1];
      const order = (await this.orderService.findById(orderId))?.data;
      if (!order) {
        return res
          .status(statusCodes.NOT_FOUND)
          .send(`${statusNames.NOT_FOUND}: Order not found!`);
      }
      try {
        await this.orderService.update(
          orderId,
          {
            paymentStatus: paymentStatuses.FAILED,
          },
          order.buyer,
        );
        return res.status(statusCodes.OK).send(statusNames.OK);
      } catch (err) {
        if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
          Logger.error(err);
        }
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send(statusNames.INTERNAL_SERVER_ERROR);
    } else {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.error(
          'There was no order id from the success url sent from stripe',
        );
      }
      return res
        .status(statusCodes.BAD_REQUEST)
        .send(
          `${statusNames.BAD_REQUEST}: Missing order id from the success url`,
        );
    }
  }
}
