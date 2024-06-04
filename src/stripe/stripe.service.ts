import { ConfigService } from '@/config/config.service';
import { STRIPE_SECRET_KEY } from '@/config/config.utils';
import { OrderService } from '@/order/order.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { StripProductLineDto } from './stripe.dto';
import { CommonResponseDto } from '@/common/common.dtos';
import { statusCodes, statusNames } from '@/common/utils/status.utils';

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
  ) {
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
    console.log('===>payment success');
    return { status: statusCodes.OK, message: statusNames.OK };
  }

  async handleCancelledStripePayment(): Promise<CommonResponseDto> {
    console.log('===>payment failed');
    return { status: statusCodes.OK, message: statusNames.OK };
  }
}
