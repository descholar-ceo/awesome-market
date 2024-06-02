import { PaginationDto } from '@/common/common.dtos';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Category } from '../entities/category.entity';

export class FindCategoryFiltersDto {
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
  @IsInt()
  @IsPositive()
  @Min(1)
  pageNumber?: number = 1;
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  recordsPerPage?: number = 10;
  @IsOptional()
  @IsIn(['name', 'createdAt', 'id', 'updatedAt'])
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
export class CategoriesDataDto {
  categories: Category[];
  pagination: PaginationDto;
}
export class CategoriesResponseDto {
  status: number;
  message: string;
  data?: CategoriesDataDto;
}
export class CategoryResponseDto {
  status: number;
  message: string;
  data?: Category;
}
