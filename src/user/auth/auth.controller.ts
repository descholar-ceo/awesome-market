import { ValidateUniqueUserPipe } from '@/pipes/validate-record-uniqueness/validate-unique-user/validate-unique-user.pipe';
import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/find-user.dto';
import { LoginDto } from '../dto/login.dto';
import { UserService } from '../user.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
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
  async refreshAccessToken(@Headers('refresh-token') refreshToken: string) {
    return await this.userService.refreshAccessToken(refreshToken);
  }
}
