import { PaginationDto } from '@/common/common.dtos';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Product } from '../entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

export class FindProductFiltersDto {
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
  @IsUUID()
  @ApiProperty({ required: false })
  categoryId?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  code?: string;
  @IsOptional()
  @ApiProperty({ required: false, default: 1 })
  pageNumber?: number = 1;
  @IsOptional()
  @ApiProperty({ required: false, default: 10 })
  recordsPerPage?: number = 10;
  @IsOptional()
  @ApiProperty({ required: false })
  minUnitPrice?: number;
  @IsOptional()
  @ApiProperty({ required: false })
  maxUnitPrice?: number;
  @IsOptional()
  @IsIn(['name', 'createdAt', 'id', 'updatedAt', 'unitPrice'])
  @ApiProperty({
    required: false,
    enum: ['name', 'createdAt', 'id', 'updatedAt', 'unitPrice'],
  })
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
export class ProductsDataDto {
  @ApiProperty({ type: [Product] })
  products: Product[];
  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
export class ProductsResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ required: false, type: ProductsDataDto })
  data?: ProductsDataDto;
}
export class ProductResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ required: false, type: Product })
  data?: Product;
}
