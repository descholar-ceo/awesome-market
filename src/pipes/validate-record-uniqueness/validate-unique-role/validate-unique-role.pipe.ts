import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { BaseValidator } from '../base-validator';
import { RoleService } from '@/role/role.service';
import { UpdateRoleDto } from '@/role/dto/update-role.dto';
import { CreateRoleDto } from '@/role/dto/create-role.dto';
import { ConfigService } from '@/config/config.service';

@Injectable()
export class ValidateUniqueRolePipe
  extends BaseValidator
  implements PipeTransform
{
  constructor(
    private readonly categoryService: RoleService,
    readonly config: ConfigService,
  ) {
    super(config);
  }
  async transform(
    value: CreateRoleDto | UpdateRoleDto,
    metadata: ArgumentMetadata,
  ) {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    await this.checkUniqueConstraints({
      objectToValidate: value,
      service: this.categoryService,
      uniqueFieldName: 'name',
      findMethodName: 'findOneByName',
      entityName: 'Role',
    });
    return value;
  }
}
