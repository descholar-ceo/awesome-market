import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payout])],
  providers: [PayoutService],
  exports: [PayoutService],
})
export class PayoutModule {}
