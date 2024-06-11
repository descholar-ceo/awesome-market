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
import { ApiProperty } from '@nestjs/swagger';

export class FindOrderFiltersDto {
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
  buyerId?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  code?: string;
  @IsOptional()
  @IsString()
  @IsEnum(orderStatuses)
  @ApiProperty({ required: false, enum: orderStatuses })
  status?: string;
  @IsOptional()
  @ApiProperty({ required: false, default: 1 })
  pageNumber?: number = 1;
  @IsOptional()
  @ApiProperty({ required: false, default: 10 })
  recordsPerPage?: number = 10;
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
export class OrdersDataDto {
  @ApiProperty({ type: [Order] })
  orders: Order[];
  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
export class OrdersResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ type: OrdersDataDto })
  data?: OrdersDataDto;
}
export class OrderResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ required: false })
  data?: Order;
}
