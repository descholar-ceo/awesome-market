import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { BaseValidator } from '../base-validator';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { UserService } from '@/user/user.service';

@Injectable()
export class ValidateUniqueUserPipe
  extends BaseValidator
  implements PipeTransform
{
  constructor(private readonly userService: UserService) {
    super();
  }
  async transform(
    value: CreateUserDto | UpdateUserDto,
    metadata: ArgumentMetadata,
  ) {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    // validate uniqueness of email
    await this.checkUniqueConstraints({
      objectToValidate: value,
      service: this.userService,
      uniqueFieldName: 'email',
      findMethodName: 'findOneByEmail',
      entityName: 'User',
    });
    // validate uniqueness of phone number
    await this.checkUniqueConstraints({
      objectToValidate: value,
      service: this.userService,
      uniqueFieldName: 'phoneNumber',
      findMethodName: 'findOneByPhoneNumber',
      entityName: 'User',
    });
    return value;
  }
}
