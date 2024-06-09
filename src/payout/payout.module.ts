import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';

@Module({
  controllers: [],
  providers: [PayoutService],
})
export class PayoutModule {}
