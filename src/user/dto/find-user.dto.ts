import { PaginationDto } from '@/common/common.dtos';
import {
  IsBooleanString,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { User } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class FindUserFiltersDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ nullable: true, required: false })
  firstName?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ nullable: true, required: false })
  lastName?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ nullable: true, required: false })
  phoneNumber?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ nullable: true, required: false })
  email?: string;
  @IsOptional()
  @IsBooleanString()
  @ApiProperty({ nullable: true, required: false })
  isActive?: boolean;
  @IsOptional()
  @IsString()
  @ApiProperty({ nullable: true, required: false })
  shippingAddress?: string;
  @IsOptional()
  @IsDateString()
  @ApiProperty({ nullable: true, required: false })
  createdFromDate?: Date;
  @IsOptional()
  @IsDateString()
  @ApiProperty({ nullable: true, required: false })
  createdToDate?: Date;
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  pageNumber?: number = 1;
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  recordsPerPage?: number = 10;
  @IsOptional()
  @IsIn(['name', 'createdAt', 'id', 'updatedAt', 'unitPrice'])
  @ApiProperty({ nullable: true, required: false })
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @ApiProperty({ nullable: true, required: false })
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
export class UsersDataDto {
  users: User[];
  pagination: PaginationDto;
}
export class UsersResponseDto {
  status: number;
  message: string;
  data?: UsersDataDto;
}
export class UserResponseDto {
  status: number;
  message: string;
  data?: User;
}
