import { Roles } from '@/decorators/roles/roles.decorator';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { ValidateUniqueUserPipe } from '@/pipes/validate-record-uniqueness/validate-unique-user/validate-unique-user.pipe';
import { ValidateIdFromParam } from '@/pipes/validate-uuid/validate-id-param';
import {
  ADMIN_ROLE_NAME,
  BUYER_ROLE_NAME,
  SELLER_ROLE_NAME,
} from '@/role/role.constants';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { FindUserFiltersDto, UsersResponseDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME, BUYER_ROLE_NAME])
  @Get(':id')
  @ApiBearerAuth('Authorization')
  @UsePipes(new ValidateIdFromParam())
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME, BUYER_ROLE_NAME])
  @Patch(':id')
  @ApiBearerAuth('Authorization')
  @UsePipes(new ValidateIdFromParam())
  update(
    @Param('id') id: string,
    @Body(ValidateUniqueUserPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Roles([ADMIN_ROLE_NAME])
  @Get()
  @ApiBearerAuth('Authorization')
  async findWithFilters(
    @Query() filters: FindUserFiltersDto,
  ): Promise<UsersResponseDto> {
    return await this.userService.findWithFilters(filters);
  }
}
