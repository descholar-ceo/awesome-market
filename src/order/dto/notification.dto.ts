import { Order } from '../entities/order.entity';

export class OrderNotificationEmailBodyOptionsDto {
  order: Order;
  apiUrl?: string;
}
