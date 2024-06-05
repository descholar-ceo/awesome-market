import { STRONG_PASSWORD_REGEX } from '@/common/utils/regex.utils';
import { IsStrongPassword } from '@/decorators/validate-password/validate-password.decorator';
import { Role } from '@/role/entities/role.entity';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword(STRONG_PASSWORD_REGEX, {
    message:
      'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  roles?: Role[];
}
