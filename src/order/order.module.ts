import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { UserModule } from '@/user/user.module';
import { InventoryModule } from '@/inventory/inventory.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), UserModule, InventoryModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
