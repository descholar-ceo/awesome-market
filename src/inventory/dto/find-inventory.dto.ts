import { PaginationDto } from '@/common/common.dtos';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Inventory } from '../entities/inventory.entity';

export class FindInventoryFiltersDto {
  @IsOptional()
  @IsDateString()
  createdFromDate?: Date;
  @IsOptional()
  @IsDateString()
  createdToDate?: Date;
  @IsOptional()
  @IsUUID()
  ownerId?: string;
  @IsOptional()
  @IsUUID()
  productId?: string;
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
  inventories: Inventory[];
  pagination: PaginationDto;
}
export class InventoriesResponseDto {
  status: number;
  message: string;
  data?: InventoriesDataDto;
}
export class InventoryResponseDto {
  status: number;
  message: string;
  data?: Inventory;
}
