import { CategoryService } from '@/category/category.service';
import { CreateCategoryDto } from '@/category/dto/create-category.dto';
import { UpdateCategoryDto } from '@/category/dto/update-category.dto';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { BaseValidator } from '../base-validator';
import { ConfigService } from '@/config/config.service';

@Injectable()
export class ValidateUniqueCategoryPipe
  extends BaseValidator
  implements PipeTransform
{
  constructor(
    private readonly categoryService: CategoryService,
    readonly config: ConfigService,
  ) {
    super(config);
  }
  async transform(
    value: CreateCategoryDto | UpdateCategoryDto,
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
      entityName: 'Category',
    });
    return value;
  }
}
