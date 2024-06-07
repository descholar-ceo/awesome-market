import { CommonResponseDto } from '@/common/common.dtos';
import { ValidateUniqueUserPipe } from '@/pipes/validate-record-uniqueness/validate-unique-user/validate-unique-user.pipe';
import { ValidateIdFromParam } from '@/pipes/validate-uuid/validate-id-param';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import {
  FindUserFiltersDto,
  UserResponseDto,
  UsersResponseDto,
} from './dto/find-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { Roles } from '@/decorators/roles/roles.decorator';
import {
  ADMIN_ROLE_NAME,
  BUYER_ROLE_NAME,
  SELLER_ROLE_NAME,
} from '@/role/role.constants';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async create(
    @Body(ValidateUniqueUserPipe) createUserData: CreateUserDto,
    @Query('user-type') userType?: string,
  ): Promise<UserResponseDto> {
    return await this.userService.create(createUserData, userType);
  }

  @Post('/login')
  async login(@Body() loginData: LoginDto) {
    return await this.userService.login(loginData);
  }

  @Get('/get-new-access-token')
  async refreshAccessToken(@Headers('authorization') refreshToken: string) {
    return await this.userService.refreshAccessToken(refreshToken);
  }

  @Get('/approve-seller-account')
  async approveSellerAccount(@Query('seller-id') sellerId: string) {
    return await this.userService.approveSellerAccount(sellerId);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME, BUYER_ROLE_NAME])
  @Get(':id')
  @UsePipes(new ValidateIdFromParam())
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME, BUYER_ROLE_NAME])
  @Patch(':id')
  @UsePipes(new ValidateIdFromParam())
  update(
    @Param('id') id: string,
    @Body(ValidateUniqueUserPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Roles([ADMIN_ROLE_NAME])
  @Delete(':id')
  @UsePipes(new ValidateIdFromParam())
  async remove(@Param('id') id: string): Promise<CommonResponseDto> {
    return this.userService.remove(id);
  }

  @Roles([ADMIN_ROLE_NAME])
  @Get()
  async findWithFilters(
    @Query() filters: FindUserFiltersDto,
  ): Promise<UsersResponseDto> {
    return await this.userService.findWithFilters(filters);
  }
}
