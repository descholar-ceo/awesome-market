import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { Roles } from '@/decorators/roles/roles.decorator';
import {
  ADMIN_ROLE,
  dotenvConfig,
  getEnvironmentValue,
  validateEnvironment,
} from '@/config/config.utils';

@UseGuards(AuthGuard, RolesGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Roles([getEnvironmentValue(validateEnvironment(dotenvConfig), ADMIN_ROLE)])
  @Post()
  async create(@Body() createRoleData: CreateRoleDto) {
    return await this.roleService.create(createRoleData);
  }

  @Roles([getEnvironmentValue(validateEnvironment(dotenvConfig), ADMIN_ROLE)])
  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Roles([getEnvironmentValue(validateEnvironment(dotenvConfig), ADMIN_ROLE)])
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.roleService.findById(id);
  }

  @Roles([getEnvironmentValue(validateEnvironment(dotenvConfig), ADMIN_ROLE)])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Roles([getEnvironmentValue(validateEnvironment(dotenvConfig), ADMIN_ROLE)])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
