import { PaginationDto } from '@/common/common.dtos';
import { IsDateString, IsIn, IsOptional } from 'class-validator';
import { User } from '../entities/user.entity';

export class FindUserFiltersDto {
  @IsOptional()
  firstName?: string;
  @IsOptional()
  lastName?: string;
  @IsOptional()
  @IsDateString()
  createdFromDate?: Date;
  @IsOptional()
  @IsDateString()
  createdToDate?: Date;
  @IsOptional()
  pageNumber?: number = 1;
  @IsOptional()
  recordsPerPage?: number = 10;
  @IsOptional()
  @IsIn(['name', 'createdAt', 'id', 'updatedAt', 'unitPrice'])
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
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
