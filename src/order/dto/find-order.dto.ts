import { PaginationDto } from '@/common/common.dtos';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Order } from '../entities/order.entity';
import { orderStatuses } from '../order.constants';

export class FindOrderFiltersDto {
  @IsOptional()
  @IsDateString()
  createdFromDate?: Date;
  @IsOptional()
  @IsDateString()
  createdToDate?: Date;
  @IsOptional()
  @IsUUID()
  buyerId?: string;
  @IsOptional()
  @IsString()
  code?: string;
  @IsOptional()
  @IsString()
  @IsEnum(orderStatuses)
  status?: string;
  @IsOptional()
  pageNumber?: number = 1;
  @IsOptional()
  recordsPerPage?: number = 10;
  @IsOptional()
  @IsIn(['quantity', 'createdAt', 'id', 'updatedAt'])
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
export class OrdersDataDto {
  orders: Order[];
  pagination: PaginationDto;
}
export class OrdersResponseDto {
  status: number;
  message: string;
  data?: OrdersDataDto;
}
export class OrderResponseDto {
  status: number;
  message: string;
  data?: Order;
}
