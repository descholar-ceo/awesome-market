import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { UserModule } from '@/user/user.module';
import { InventoryModule } from '@/inventory/inventory.module';
import { OrderItemModule } from '@/order-item/order-item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    UserModule,
    InventoryModule,
    OrderItemModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}