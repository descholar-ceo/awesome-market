import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { orderStatuses, paymentStatuses } from '../order.constants';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum(orderStatuses)
  @ApiProperty({ enum: orderStatuses, required: false })
  status?: orderStatuses;
  @IsOptional()
  @IsEnum(paymentStatuses)
  @ApiProperty({ required: false, enum: paymentStatuses })
  paymentStatus?: paymentStatuses;
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(orderStatuses)
  @ApiProperty({ enum: orderStatuses })
  status: orderStatuses;
}
