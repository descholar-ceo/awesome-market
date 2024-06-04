import { statusCodes } from '@/common/utils/status.utils';
import { ValidateIdFromParam } from '@/pipes/validate-uuid/validate-id-param';
import { Controller, Get, Param, Query, Res, UsePipes } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Response } from 'express';

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
}
