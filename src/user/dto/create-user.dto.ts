import { STRONG_PASSWORD_REGEX } from '@/common/utils/regex.utils';
import { IsStrongPassword } from '@/decorators/validate-password/validate-password.decorator';
import { Role } from '@/role/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsStrongPassword(STRONG_PASSWORD_REGEX, {
    message:
      'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;

  @IsOptional()
  @ApiProperty({ type: [Role], required: false })
  roles?: Role[];
}
