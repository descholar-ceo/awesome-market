import { CreateCategoryDto } from '@/category/dto/create-category.dto';
import { UpdateCategoryDto } from '@/category/dto/update-category.dto';
import { PRODUCTION } from '@/common/constants.common';
import { CustomConflictException } from '@/common/exception/custom.exception';
import { ConfigService } from '@/config/config.service';
import { NODE_ENV } from '@/config/config.utils';
import { CreateRoleDto } from '@/role/dto/create-role.dto';
import { UpdateRoleDto } from '@/role/dto/update-role.dto';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { Logger } from '@nestjs/common';

export class BaseValidator {
  constructor(readonly config: ConfigService) {}
  toValidate(metaType: any): boolean {
    const typesToValidate = [
      CreateCategoryDto,
      UpdateCategoryDto,
      CreateUserDto,
      UpdateUserDto,
      CreateRoleDto,
      UpdateRoleDto,
    ];
    return typesToValidate.includes(metaType);
  }

  async checkUniqueConstraints({
    objectToValidate,
    uniqueFieldName,
    service,
    findMethodName,
    entityName,
  }: {
    objectToValidate: Record<string, any>;
    uniqueFieldName: string;
    service: object;
    findMethodName: string;
    entityName: string;
  }): Promise<void> {
    try {
      const passedValue = objectToValidate[uniqueFieldName];
      const { data: valueFromDb } =
        (await service[findMethodName](passedValue)) ?? {};
      if (passedValue && valueFromDb) this.throwConflictException(entityName);
      return;
    } catch (err) {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.error(err);
      }
      if (err?.message?.toLowerCase().includes('not found')) {
        return;
      }
      this.throwConflictException(entityName);
    }
  }
  private throwConflictException(entityName: string): void {
    throw new CustomConflictException({
      messages: [`${entityName} already exists`],
    });
  }
}
