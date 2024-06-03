import { Inventory } from '@/inventory/entities/inventory.entity';
import { Order } from '@/order/entities/order.entity';
export class CreateOrderItemDto {
  inventory: Inventory;
  order: Order;
  quantity: number;
}
