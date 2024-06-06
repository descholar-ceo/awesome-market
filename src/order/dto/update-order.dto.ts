import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { orderStatuses, paymentStatuses } from '../order.constants';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum(orderStatuses)
  status?: orderStatuses;
  @IsOptional()
  @IsEnum(paymentStatuses)
  paymentStatus?: paymentStatuses;
}
