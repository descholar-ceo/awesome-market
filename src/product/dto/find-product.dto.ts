import { PaginationDto } from '@/common/common.dtos';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Product } from '../entities/product.entity';

export class FindProductFiltersDto {
  @IsOptional()
  name?: string;
  @IsOptional()
  description?: string;
  @IsOptional()
  @IsDateString()
  createdFromDate?: Date;
  @IsOptional()
  @IsDateString()
  createdToDate?: Date;
  @IsOptional()
  @IsUUID()
  createdBy?: string;
  @IsOptional()
  @IsUUID()
  categoryId?: string;
  @IsOptional()
  @IsString()
  code?: string;
  @IsOptional()
  pageNumber?: number = 1;
  @IsOptional()
  recordsPerPage?: number = 10;
  @IsOptional()
  minUnitPrice?: number;
  @IsOptional()
  maxUnitPrice?: number;
  @IsOptional()
  @IsIn(['name', 'createdAt', 'id', 'updatedAt'])
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
export class ProductsDataDto {
  products: Product[];
  pagination: PaginationDto;
}
export class ProductsResponseDto {
  status: number;
  message: string;
  data?: ProductsDataDto;
}
export class ProductResponseDto {
  status: number;
  message: string;
  data?: Product;
}
