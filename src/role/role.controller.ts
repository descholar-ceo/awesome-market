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
  UseGuards,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ADMIN_ROLE_NAME } from './role.constants';
import { RoleService } from './role.service';
import { ValidateUniqueRolePipe } from '@/pipes/validate-record-uniqueness/validate-unique-role/validate-unique-role.pipe';

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
  findAll() {
    return this.roleService.findAll();
  }

  @Roles([ADMIN_ROLE_NAME])
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.roleService.findById(id);
  }

  @Roles([ADMIN_ROLE_NAME])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidateUniqueRolePipe) updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Roles([ADMIN_ROLE_NAME])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
