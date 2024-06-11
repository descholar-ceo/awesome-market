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
import {
  FindUserFiltersDto,
  UserResponseDto,
  UsersResponseDto,
} from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { CommonErrorResponseDto } from '@/common/common.dtos';

@ApiTags('users')
@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
@ApiBearerAuth('Authorization')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME, BUYER_ROLE_NAME])
  @Get(':id')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Find a user',
    description: 'It uses user id passed as a parameter to fetch user profile',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'User profile',
    type: UserResponseDto,
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
  findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOneById(id);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME, BUYER_ROLE_NAME])
  @Patch(':id')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Update a user',
    description:
      'It uses user id passed as a parameter and updateUserData passed as request body to update a user profile',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'User profile',
    type: UserResponseDto,
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
    @Body(ValidateUniqueUserPipe) updateUserData: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserData);
  }

  @Roles([ADMIN_ROLE_NAME])
  @Get()
  @ApiOperation({
    summary: 'Find all users with filters',
    description: 'It uses filters to fetch all users, alongside pagination',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Users list with pagination',
    type: UsersResponseDto,
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
  async findWithFilters(
    @Query() filters: FindUserFiltersDto,
  ): Promise<UsersResponseDto> {
    return await this.userService.findWithFilters(filters);
  }
}
