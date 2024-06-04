import { Order } from '../entities/order.entity';

export class PendingOrderNotificationEmailBodyOptionsDto {
  order: Order;
}
