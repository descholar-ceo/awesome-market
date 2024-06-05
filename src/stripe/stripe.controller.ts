import { statusCodes } from '@/common/utils/status.utils';
import { ValidateIdFromParam } from '@/pipes/validate-uuid/validate-id-param';
import {
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';

@Controller('orders')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}
  @Get(':id/checkout')
  @UsePipes(new ValidateIdFromParam())
  async createCheckoutSession(
    @Param('id') id: string,
    @Query('success-url') successUrl: string,
    @Query('cancel-url') cancelUrl: string,
    @Res() res: Response,
  ) {
    const session = await this.stripeService.createCheckoutSession(
      id,
      successUrl,
      cancelUrl,
    );
    return res.redirect(statusCodes.SEE_OTHER, session.url);
  }
  @Get(':id/cancel')
  handleCancelledStripePayment() {
    return this.stripeService.handleCancelledStripePayment();
  }
  @Get(':id/success')
  handleSuccessfulStripePayment() {
    return this.stripeService.handleSuccessfulStripePayment();
  }

  @Post('checkout/webhook')
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') stripeSignature: string,
  ) {
    return await this.stripeService.handleStripeWebhook(
      stripeSignature,
      req['rawBody'],
      res,
    );
  }
}
