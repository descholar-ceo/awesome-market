import { CreateCategoryDto } from '@/category/dto/create-category.dto';
import { UpdateCategoryDto } from '@/category/dto/update-category.dto';
import { CreateRoleDto } from '@/role/dto/create-role.dto';
import { UpdateRoleDto } from '@/role/dto/update-role.dto';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { ConflictException } from '@nestjs/common';

export class BaseValidator {
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
    const passedValue = objectToValidate[uniqueFieldName];
    const valueFromDb =
      (await service[findMethodName](passedValue))?.data ??
      (await service[findMethodName](passedValue));
    if (passedValue && valueFromDb) {
      throw new ConflictException(`${entityName} already exists`);
    }
  }
}
