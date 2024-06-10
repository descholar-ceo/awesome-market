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
import { FindRoleFiltersDto } from './dto/find-role.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('roles')
@UseGuards(AuthGuard, RolesGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Roles([ADMIN_ROLE_NAME])
  @Post()
  async create(@Body(ValidateUniqueRolePipe) createRoleData: CreateRoleDto) {
    return await this.roleService.create(createRoleData);
  }

  @Roles([ADMIN_ROLE_NAME])
  @Get()
  findWithFilters(@Query() filters: FindRoleFiltersDto) {
    return this.roleService.findWithFilters(filters);
  }

  @Roles([ADMIN_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.roleService.findOneById(id);
  }

  @Roles([ADMIN_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidateUniqueRolePipe) updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Roles([ADMIN_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
