import { PaginationDto } from '@/common/common.dtos';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { Category } from '../entities/category.entity';
import { ApiProperty } from '@nestjs/swagger';

export class FindCategoryFiltersDto {
  @IsOptional()
  @ApiProperty({ required: false })
  name?: string;
  @IsOptional()
  @ApiProperty({ required: false })
  description?: string;
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  createdFromDate?: Date;
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  createdToDate?: Date;
  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false })
  createdBy?: string;
  @IsOptional()
  @ApiProperty({ default: 1, required: false })
  pageNumber?: number = 1;
  @IsOptional()
  @ApiProperty({ default: 10, required: false })
  recordsPerPage?: number = 10;
  @IsOptional()
  @IsIn(['name', 'createdAt', 'id', 'updatedAt'])
  @ApiProperty({
    required: false,
    enum: ['name', 'createdAt', 'id', 'updatedAt'],
  })
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
export class CategoriesDataDto {
  @ApiProperty({ type: [Category] })
  categories: Category[];
  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
export class CategoriesResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ required: false, type: CategoriesDataDto })
  data?: CategoriesDataDto;
}
export class CategoryResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ required: false, type: Category })
  data?: Category;
}
