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
  @ApiProperty({ required: false })
  firstName?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  lastName?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  phoneNumber?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  email?: string;
  @IsOptional()
  @IsBooleanString()
  @ApiProperty({ required: false })
  isActive?: boolean;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  shippingAddress?: string;
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  createdFromDate?: Date;
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  createdToDate?: Date;
  @IsOptional()
  @ApiProperty({ required: false })
  pageNumber?: number = 1;
  @IsOptional()
  @ApiProperty({ required: false })
  recordsPerPage?: number = 10;
  @IsOptional()
  @IsIn(['name', 'createdAt', 'id', 'updatedAt', 'unitPrice'])
  @ApiProperty({ required: false })
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @ApiProperty({ required: false })
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
export class UsersDataDto {
  @ApiProperty({ type: [User] })
  users: User[];
  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
export class UsersResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ type: UsersDataDto })
  data?: UsersDataDto;
}
export class UserResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ type: User })
  data?: User;
}
