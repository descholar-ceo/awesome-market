import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { UserModule } from '@/user/user.module';
import { InventoryModule } from '@/inventory/inventory.module';
import { OrderItemModule } from '@/order-item/order-item.module';
import { MailModule } from '@/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    UserModule,
    InventoryModule,
    OrderItemModule,
    MailModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
