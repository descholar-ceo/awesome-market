import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { orderStatuses, paymentStatuses } from '../order.constants';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  status?: orderStatuses;
  paymentStatus?: paymentStatuses;
}
