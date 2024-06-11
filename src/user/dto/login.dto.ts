import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @ApiProperty()
  email: string;
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export class AuthTokenDataDto {
  @ApiProperty()
  accessToken: string;
  @ApiProperty({ required: false })
  refreshToken?: string;
}

export class LoginResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ type: AuthTokenDataDto })
  data?: AuthTokenDataDto;
}
