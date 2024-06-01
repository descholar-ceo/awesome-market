import { isUserAdmin } from './../user/user.utils';
import { prepareDateInterval } from '@/common/utils/dates.utils';
import { statusCodes, statusNames } from '@/common/utils/status.utils';
import { ConfigService } from '@/config/config.service';
import { User } from '@/user/entities/user.entity';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  CategoriesResponseDto,
  CategoryResponseDto,
  FindCategoryFiltersDto,
} from './dto/find-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { plainToInstance } from 'class-transformer';
import { CommonResponseDto } from '@/common/common.dtos';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly config: ConfigService,
  ) {}

  async create(
    createCategoryData: CreateCategoryDto,
    currUser: User,
  ): Promise<CategoryResponseDto> {
    const newCategory = this.categoryRepository.create(createCategoryData);
    newCategory.createdBy = currUser;
    newCategory.updatedBy = currUser;
    const category = await this.categoryRepository.save(newCategory);

    return {
      status: statusCodes.CREATED,
      message: statusNames.CREATED,
      data: category,
    };
  }

  async findWithFilters(
    filters: FindCategoryFiltersDto,
  ): Promise<CategoriesResponseDto> {
    const {
      name,
      description,
      createdFromDate,
      createdToDate,
      createdBy,
      pageNumber,
      recordsPerPage,
    } = filters;
    const { startDate, endDate } = this.getDateInterval(
      createdFromDate,
      createdToDate,
    );
    const findCategoriesQuery = this.buildFindCategoriesQuery(
      name,
      description,
      createdBy,
      startDate,
      endDate,
    );

    const totalRecords = await findCategoriesQuery.getCount();
    if (totalRecords === 0) {
      return {
        status: statusCodes.NOT_FOUND,
        message: 'No records found',
      };
    }

    const categories = await findCategoriesQuery
      .leftJoinAndSelect('category.createdBy', 'createdBy')
      .leftJoinAndSelect('category.updatedBy', 'updatedBy')
      .skip((pageNumber - 1) * recordsPerPage)
      .take(recordsPerPage)
      .getMany();

    const pages = Math.ceil(totalRecords / recordsPerPage);

    return {
      status: statusCodes.OK,
      message: statusNames.OK,
      data: {
        categories: plainToInstance(Category, categories, {
          excludeExtraneousValues: true,
        }),
        pagination: {
          pages,
          totalRecords,
          currentPage: pageNumber ?? 1,
          recordsPerPage: recordsPerPage ?? 10,
        },
      },
    };
  }

  async findById(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return {
      status: statusCodes.OK,
      message: statusNames.OK,
      data: plainToInstance(Category, category, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async update(
    id: string,
    updateCategoryData: UpdateCategoryDto,
    currUser: User,
  ): Promise<CategoryResponseDto> {
    const category = await this.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (!isUserAdmin(currUser) && category.data.createdBy.id !== currUser.id) {
      throw new ForbiddenException(
        'You cannot update a category that you did not create',
      );
    }

    Object.assign(category.data, updateCategoryData);
    const updatedCategory = await this.categoryRepository.save(category.data);

    return {
      status: statusCodes.OK,
      message: statusNames.OK,
      data: updatedCategory,
    };
  }

  async remove(id: string, currUser: User): Promise<CommonResponseDto> {
    const category = await this.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (!isUserAdmin(currUser) && category.data.createdBy.id !== currUser.id) {
      throw new ForbiddenException(
        'You cannot delete a category that you did not create',
      );
    }

    const deleteResult: DeleteResult = await this.categoryRepository.delete(id);
    if (!deleteResult.affected) {
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong, try again',
      };
    }

    return { status: statusCodes.OK, message: statusNames.OK };
  }

  private getDateInterval(createdFromDate?: Date, createdToDate?: Date) {
    if (!createdFromDate && !createdToDate) {
      return { startDate: undefined, endDate: undefined };
    }

    const { startOfTheDay, endOfTheDay } = prepareDateInterval(
      createdFromDate ? new Date(createdFromDate) : null,
      createdToDate ? new Date(createdToDate) : null,
    );

    return { startDate: startOfTheDay, endDate: endOfTheDay };
  }

  private buildFindCategoriesQuery(
    name?: string,
    description?: string,
    createdBy?: string,
    startDate?: Date,
    endDate?: Date,
  ): SelectQueryBuilder<Category> {
    const query = this.categoryRepository.createQueryBuilder('category');

    if (name) {
      query.andWhere('category.name LIKE :name', { name: `%${name}%` });
    }

    if (description) {
      query.andWhere('category.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (createdBy) {
      query.andWhere('category.createdBy.id = :createdBy', { createdBy });
    }

    if (startDate) {
      query.andWhere('category.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('category.createdAt <= :endDate', { endDate });
    }

    return query;
  }
}
