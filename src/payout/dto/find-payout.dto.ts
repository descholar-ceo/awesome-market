import { PaginationDto } from '@/common/common.dtos';
import { paymentStatuses } from '@/order/order.constants';
import { IsEnum, IsOptional } from 'class-validator';
import { Payout } from '../entities/payout.entity';

export class FindPayoutFiltersDto {
  @IsOptional()
  @IsEnum(paymentStatuses)
  status?: paymentStatuses;
}
export class PayoutsDataDto {
  payouts: Payout[];
  pagination: PaginationDto;
}
export class PayoutsResponseDto {
  status: number;
  message: string;
  data?: PayoutsDataDto;
}
export class PayoutResponseDto {
  status: number;
  message: string;
  data?: Payout;
}
