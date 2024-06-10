import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ required: false })
  isActive?: boolean;
  @ApiProperty({ required: false })
  stripeAccountId?: string;
}
