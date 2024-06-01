import { PaginationDto } from '@/common/common.dtos';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
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
