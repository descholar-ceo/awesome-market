import { PaginationDto } from '@/common/common.dtos';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Inventory } from '../entities/inventory.entity';
import { ApiProperty } from '@nestjs/swagger';

export class FindInventoryFiltersDto {
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
  ownerId?: string;
  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false })
  productId?: string;
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
  minQuantity?: number;
  @IsOptional()
  @ApiProperty({ required: false })
  maxQuantity?: number;
  @IsOptional()
  @IsIn(['quantity', 'createdAt', 'id', 'updatedAt'])
  @ApiProperty({
    required: false,
    enum: ['quantity', 'createdAt', 'id', 'updatedAt'],
  })
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
export class InventoriesDataDto {
  @ApiProperty({ type: Inventory })
  inventories: Inventory[];
  @ApiProperty()
  pagination: PaginationDto;
}
export class InventoriesResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty()
  data?: InventoriesDataDto;
}
export class InventoryResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ required: true })
  data?: Inventory;
}
