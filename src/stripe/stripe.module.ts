import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { OrderModule } from '@/order/order.module';
import { MailModule } from '@/mail/mail.module';

@Module({
  imports: [OrderModule, MailModule],
  providers: [StripeService],
  exports: [StripeService],
  controllers: [StripeController],
})
export class StripeModule {}
