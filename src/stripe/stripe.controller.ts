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
import { UserService } from '@/user/user.service';
import { CommonResponseDto } from '@/common/common.dtos';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('stripe-public')
@Controller('orders')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
  ) {}

  @Get(':id/checkout')
  @UsePipes(new ValidateIdFromParam())
  async createCheckoutSession(
    @Param('id') id: string,
    @Query('success-url') successUrl: string,
    @Query('cancel-url') cancelUrl: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const session = await this.stripeService.createCheckoutSession(
      id,
      successUrl,
      cancelUrl,
      token,
    );
    if (!!session['url']) {
      return res.redirect(statusCodes.SEE_OTHER, session['url']);
    } else {
      return res
        .status(
          isNaN(Number(session.status))
            ? statusCodes.INTERNAL_SERVER_ERROR
            : Number(session.status),
        )
        .send(session['message']);
    }
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
    @Headers('stripe-signature') stripeSignature: string,
  ) {
    return await this.stripeService.handleStripeWebhook(
      stripeSignature,
      req['rawBody'],
    );
  }

  @Get('users/:id/approve-seller-account')
  @UsePipes(new ValidateIdFromParam())
  async approveSellerAccount(@Param('id') sellerId: string) {
    return await this.userService.approveSellerAccount(
      sellerId,
      this.stripeService,
    );
  }

  @Get('users/:id/get-new-stripe-account-onboarding-url')
  @UsePipes(new ValidateIdFromParam())
  async getNewStripe(@Param('id') id: string) {
    return await this.userService.generateNewStripeOnBoardingUrl(
      id,
      this.stripeService,
    );
  }

  @Get('users/:id/stripe-express-account-onboarding-success')
  @UsePipes(new ValidateIdFromParam())
  handleSuccessfulStripeExpressAccountOnboarding(
    @Param('id') userId: string,
  ): Promise<CommonResponseDto> {
    return this.stripeService.handleSuccessfulStripeExpressAccountOnboarding(
      userId,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processPayouts(): Promise<void> {
    return await this.stripeService.processPayouts();
  }
}
