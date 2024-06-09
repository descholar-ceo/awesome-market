import { MailModule } from '@/mail/mail.module';
import { OrderModule } from '@/order/order.module';
import { PayoutModule } from '@/payout/payout.module';
import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [OrderModule, MailModule, PayoutModule, UserModule],
  providers: [StripeService],
  exports: [StripeService],
  controllers: [StripeController],
})
export class StripeModule {}
