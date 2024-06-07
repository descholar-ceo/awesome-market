import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { UserService } from '../user.service';
import { LoginDto } from '../dto/login.dto';
import { UserResponseDto } from '../dto/find-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { ValidateUniqueUserPipe } from '@/pipes/validate-record-uniqueness/validate-unique-user/validate-unique-user.pipe';

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
  async refreshAccessToken(@Headers('authorization') refreshToken: string) {
    return await this.userService.refreshAccessToken(refreshToken);
  }

  @Get('/approve-seller-account')
  async approveSellerAccount(@Query('seller-id') sellerId: string) {
    return await this.userService.approveSellerAccount(sellerId);
  }
}
