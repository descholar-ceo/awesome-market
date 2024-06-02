import { PaginationDto } from '@/common/common.dtos';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Order } from '../entities/order.entity';

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
  @IsUUID()
  inventoryId?: string;
  @IsOptional()
  @IsString()
  code?: string;
  @IsOptional()
  pageNumber?: number = 1;
  @IsOptional()
  recordsPerPage?: number = 10;
  @IsOptional()
  minQuantity?: number;
  @IsOptional()
  maxQuantity?: number;
  @IsOptional()
  @IsIn(['quantity', 'createdAt', 'id', 'updatedAt'])
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
export class InventoriesDataDto {
  inventories: Order[];
  pagination: PaginationDto;
}
export class InventoriesResponseDto {
  status: number;
  message: string;
  data?: InventoriesDataDto;
}
export class OrderResponseDto {
  status: number;
  message: string;
  data?: Order;
}
