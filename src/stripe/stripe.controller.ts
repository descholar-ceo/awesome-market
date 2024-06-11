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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('stripe-public')
@Controller('orders')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
  ) {}

  @Get(':id/checkout')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'It redirects to Stripe Checkout page',
    description:
      'This API is called when a buyer clicks on the payment link sent to him via email after placing an order, it will redirects the buyer to stripe checkout page, in order to make it work, read how to configure the stripe account  on: [Configure Stripe API Key and Webhook](https://github.com/descholar-ceo/awesome-market?tab=readme-ov-file#configure-stripe-api-key-and-webhook)',
  })
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
  @ApiOperation({
    summary: 'Stripe redirects here for failed checkout',
    description:
      'This API is called when a checkout session from stripe has failed',
  })
  handleCancelledStripePayment() {
    return this.stripeService.handleCancelledStripePayment();
  }
  @Get(':id/success')
  @ApiOperation({
    summary: 'Stripe redirects here for successful checkout',
    description:
      'This API is called when a checkout session from stripe has succeeded',
  })
  handleSuccessfulStripePayment() {
    return this.stripeService.handleSuccessfulStripePayment();
  }

  @Post('checkout/webhook')
  @ApiOperation({
    summary: 'Stripe sends checkout data whenever a checkout is completed',
    description:
      'This Webhook API is called whenever a checkout session from stripe has been completed',
  })
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
  @ApiOperation({
    summary: 'Approving seller account',
    description:
      'This API is called when an admin clicks on a link for approving a seller account sent to him via email after a seller signs up, whenever a seller account is approved, the platform will create him a stripe express account, to make this works, learn how to configure your strip account in order to enable `connect`: [Configure Stripe API Key and Webhook](https://github.com/descholar-ceo/awesome-market?tab=readme-ov-file#configure-stripe-api-key-and-webhook)',
  })
  async approveSellerAccount(@Param('id') sellerId: string) {
    return await this.userService.approveSellerAccount(
      sellerId,
      this.stripeService,
    );
  }

  @Get('users/:id/get-new-stripe-account-onboarding-url')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary:
      'Getting a new onboarding URL for a seller express account on stripe',
    description:
      'A seller will be redirected on this API when he clicks on the link for re-gaining onboarding URL when the first one has expired',
  })
  async getNewStripe(@Param('id') id: string) {
    return await this.userService.generateNewStripeOnBoardingUrl(
      id,
      this.stripeService,
    );
  }

  @Get('users/:id/stripe-express-account-onboarding-success')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Stripe redirects here after successful onboarding',
    description:
      'When a seller has completed onboarding of his express stripe account',
  })
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
