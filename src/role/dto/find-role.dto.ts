import { PaginationDto } from '@/common/common.dtos';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { Role } from '../entities/role.entity';

export class FindRoleFiltersDto {
  @IsOptional()
  name?: string;
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
  pageNumber?: number = 1;
  @IsOptional()
  recordsPerPage?: number = 10;
  @IsOptional()
  @IsIn(['name', 'createdAt', 'id', 'updatedAt'])
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
export class RolesDataDto {
  roles: Role[];
  pagination: PaginationDto;
}
export class RolesResponseDto {
  status: number;
  message: string;
  data?: RolesDataDto;
}
export class RoleResponseDto {
  status: number;
  message: string;
  data?: Role;
}
