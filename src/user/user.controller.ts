import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Query,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { ValidateUuidPipe } from '@/pipes/validate-uuid/validate-uuid';
import { CommonResponseDto } from '@/common/common.dtos';
import { ValidateIdFromParam } from '@/pipes/validate-uuid/validate-id-param';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() createUserData: CreateUserDto,
    @Query('user-type') userType?: string,
  ) {
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

  // @Get(':id')
  // @UsePipes(new ValidateUuidPipe())
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(id);
  // }

  @Patch(':id')
  @UsePipes(new ValidateIdFromParam())
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UsePipes(new ValidateUuidPipe())
  async remove(@Param('id') id: string): Promise<CommonResponseDto> {
    return this.userService.remove(id);
  }
}
