import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { orderStatuses, paymentStatuses } from '../order.constants';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum(orderStatuses)
  status?: orderStatuses;
  @IsOptional()
  @IsEnum(paymentStatuses)
  paymentStatus?: paymentStatuses;
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(orderStatuses)
  status?: orderStatuses;
}
