import { CategoryService } from '@/category/category.service';
import { CreateCategoryDto } from '@/category/dto/create-category.dto';
import { UpdateCategoryDto } from '@/category/dto/update-category.dto';
import {
  ArgumentMetadata,
  ConflictException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ValidateUniqueCategoryPipe implements PipeTransform {
  constructor(private readonly categoryService: CategoryService) {}

  async transform(
    value: CreateCategoryDto | UpdateCategoryDto,
    metadata: ArgumentMetadata,
  ) {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    await this.checkUniqueConstraints(value);

    return value;
  }

  private toValidate(metatype: any): boolean {
    const types = [CreateCategoryDto, UpdateCategoryDto];
    return types.includes(metatype);
  }

  private async checkUniqueConstraints(
    value: CreateCategoryDto | UpdateCategoryDto,
  ): Promise<void> {
    const { name } = value;
    if (name && (await this.categoryService.findOneByName(name))?.data) {
      throw new ConflictException('Category already exists');
    }
  }
}
