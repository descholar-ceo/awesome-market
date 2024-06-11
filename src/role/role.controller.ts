import { Roles } from '@/decorators/roles/roles.decorator';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ADMIN_ROLE_NAME } from './role.constants';
import { RoleService } from './role.service';
import { ValidateUniqueRolePipe } from '@/pipes/validate-record-uniqueness/validate-unique-role/validate-unique-role.pipe';
import { ValidateIdFromParam } from '@/pipes/validate-uuid/validate-id-param';
import {
  FindRoleFiltersDto,
  RoleResponseDto,
  RolesResponseDto,
} from './dto/find-role.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { CommonErrorResponseDto } from '@/common/common.dtos';

@ApiTags('roles')
@UseGuards(AuthGuard, RolesGuard)
@Controller('roles')
@ApiBearerAuth('Authorization')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Roles([ADMIN_ROLE_NAME])
  @Post()
  @ApiOperation({
    summary: 'Create a new role',
    description:
      'It uses createRoleData passed as request body to create a role',
  })
  @ApiResponse({
    status: statusCodes.CREATED,
    description: 'Created role details',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.CONFLICT,
    description: statusMessages.CONFLICT,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  async create(@Body(ValidateUniqueRolePipe) createRoleData: CreateRoleDto) {
    return await this.roleService.create(createRoleData);
  }

  @Roles([ADMIN_ROLE_NAME])
  @Get()
  @ApiOperation({
    summary: 'Find all roles with filters',
    description: 'It uses filters to fetch all roles, alongside pagination',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Roles list with pagination',
    type: RolesResponseDto,
  })
  @ApiResponse({
    status: statusCodes.NOT_FOUND,
    description: statusMessages.NOT_FOUND,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.FORBIDDEN,
    description: statusMessages.FORBIDDEN,
    type: CommonErrorResponseDto,
  })
  findWithFilters(@Query() filters: FindRoleFiltersDto) {
    return this.roleService.findWithFilters(filters);
  }

  @Roles([ADMIN_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
  @Get(':id')
  @ApiOperation({
    summary: 'Find a role',
    description: 'It uses role id passed as a parameter to fetch role details',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Role details',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: statusCodes.NOT_FOUND,
    description: statusMessages.NOT_FOUND,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.FORBIDDEN,
    description: statusMessages.FORBIDDEN,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
    type: CommonErrorResponseDto,
  })
  findById(@Param('id') id: string) {
    return this.roleService.findOneById(id);
  }

  @Roles([ADMIN_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a role',
    description:
      'It uses roleId passed as a parameter and updateRoleData passed as request body to update a role',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Role details',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: statusCodes.NOT_FOUND,
    description: statusMessages.NOT_FOUND,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.FORBIDDEN,
    description: statusMessages.FORBIDDEN,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.CONFLICT,
    description: statusMessages.CONFLICT,
    type: CommonErrorResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body(ValidateUniqueRolePipe) updateRoleData: UpdateRoleDto,
  ) {
    return this.roleService.update(id, updateRoleData);
  }

  @Roles([ADMIN_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletes a role',
    description: 'It uses roleId passed as a parameter to delete role',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Role details',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: statusCodes.NOT_FOUND,
    description: statusMessages.NOT_FOUND,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.FORBIDDEN,
    description: statusMessages.FORBIDDEN,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
    type: CommonErrorResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
