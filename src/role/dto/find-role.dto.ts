import { PaginationDto } from '@/common/common.dtos';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { Role } from '../entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';

export class FindRoleFiltersDto {
  @IsOptional()
  @ApiProperty({ required: false })
  name?: string;
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
  @ApiProperty({ required: false, default: 1 })
  pageNumber?: number = 1;
  @IsOptional()
  @ApiProperty({ required: false, default: 10 })
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
export class RolesDataDto {
  @ApiProperty({ type: [Role] })
  roles: Role[];
  @ApiProperty()
  pagination: PaginationDto;
}
export class RolesResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ required: false, type: RolesDataDto })
  data?: RolesDataDto;
}
export class RoleResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ required: false, type: Role })
  data?: Role;
}
