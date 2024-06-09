import { Order } from '@/order/entities/order.entity';
import { User } from '@/user/entities/user.entity';

export class CreatePayoutDto {
  seller: User;
  order: Order;
  amount: number;
}
