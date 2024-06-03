import { Module } from '@nestjs/common';
import { OrderItemService } from './order-item.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem])],
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemModule {}
