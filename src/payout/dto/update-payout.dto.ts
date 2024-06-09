import { paymentStatuses } from '@/order/order.constants';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdatePayoutDto {
  @IsOptional()
  @IsEnum(paymentStatuses)
  status?: paymentStatuses;
  @IsOptional()
  processedAt?: Date;
}
