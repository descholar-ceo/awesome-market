import { ValidateUniqueUserPipe } from '@/pipes/validate-record-uniqueness/validate-unique-user/validate-unique-user.pipe';
import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/find-user.dto';
import { LoginDto, LoginResponseDto } from '../dto/login.dto';
import { UserService } from '../user.service';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { CommonErrorResponseDto } from '@/common/common.dtos';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  @ApiOperation({
    summary: 'Signup a new user',
    description:
      'It uses createUserData passed as request body to create a user profile',
  })
  @ApiResponse({
    status: statusCodes.CREATED,
    description: 'Created user profile',
    type: UserResponseDto,
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
  @ApiQuery({ name: 'user-type', required: false, enum: ['seller'] })
  async create(
    @Body(ValidateUniqueUserPipe) createUserData: CreateUserDto,
    @Query('user-type') userType?: string,
  ): Promise<UserResponseDto> {
    return await this.userService.create(createUserData, userType);
  }

  @Post('/login')
  @ApiOperation({
    summary: 'Login a user',
    description: 'It uses loginData passed as request body to login a user',
  })
  @ApiResponse({
    status: statusCodes.CREATED,
    description: 'Returns access and refresh tokens',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  async login(@Body() loginData: LoginDto): Promise<LoginResponseDto> {
    return await this.userService.login(loginData);
  }

  @Get('/get-new-access-token')
  @ApiOperation({
    summary: 'Generate a new access token',
    description:
      'It uses a refresh-token passed as a header to get a new access token',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Returns access only',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  @ApiHeader({ name: 'refresh-token', required: true })
  async refreshAccessToken(
    @Headers('refresh-token') refreshToken: string,
  ): Promise<LoginResponseDto> {
    return await this.userService.refreshAccessToken(refreshToken);
  }
}
