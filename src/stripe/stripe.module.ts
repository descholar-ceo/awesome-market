import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { OrderModule } from '@/order/order.module';

@Module({
  imports: [OrderModule],
  providers: [StripeService],
  exports: [StripeService],
  controllers: [StripeController],
})
export class StripeModule {}
