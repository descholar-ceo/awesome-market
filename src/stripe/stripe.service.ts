import { ConfigService } from '@/config/config.service';
import {
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

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(
    private readonly config: ConfigService,
    private readonly orderService: OrderService,
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
      message: `${statusNames.OK}: We will communicate further steps via your email`,
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

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutSessionCompleted(session, res);
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
    console.log('Checkout Session Completed: ', session);
    console.log('===>session: ', session.success_url);
    return res.status(statusCodes.OK).send(statusNames.OK);
  }
}
