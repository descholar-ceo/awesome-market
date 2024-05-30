import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  status: number;
  message: string;
  data?: {
    accessToken: string;
    refreshToken?: string;
  };
}
