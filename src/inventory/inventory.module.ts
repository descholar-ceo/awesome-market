import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { ProductModule } from '@/product/product.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory]), ProductModule, UserModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
