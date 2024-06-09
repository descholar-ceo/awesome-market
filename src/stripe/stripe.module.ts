import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { OrderModule } from '@/order/order.module';
import { MailModule } from '@/mail/mail.module';
import { PayoutModule } from '@/payout/payout.module';

@Module({
  imports: [OrderModule, MailModule, PayoutModule],
  providers: [StripeService],
  exports: [StripeService],
  controllers: [StripeController],
})
export class StripeModule {}
