import {
  CustomForbiddenException,
  CustomNotFoundException,
} from '@/common/exception/custom.exception';
import { getDateInterval } from '@/common/utils/dates.utils';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { User } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import {
  FindOneOptions,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { isUserAdmin } from './../user/user.utils';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  CategoriesResponseDto,
  CategoryResponseDto,
  FindCategoryFiltersDto,
} from './dto/find-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
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
      message: statusMessages.CREATED,
      data: category,
    };
  }

  async findOneByName(
    name: string,
    queryRunner?: QueryRunner,
  ): Promise<CategoryResponseDto> {
    return await this.findOneBy({ where: { name } }, queryRunner);
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
      sortBy,
      sortOrder,
    } = filters;
    const { startDate, endDate } = getDateInterval(
      createdFromDate,
      createdToDate,
    );
    const findCategoriesQuery = this.buildFindCategoriesQuery(
      name,
      description,
      createdBy,
      startDate,
      endDate,
      sortBy,
      sortOrder?.toUpperCase(),
    );

    const totalRecords = await findCategoriesQuery.getCount();
    if (totalRecords === 0) {
      throw new CustomNotFoundException({ messages: ['No records found'] });
    }
    const page =
      isNaN(pageNumber) || Number(pageNumber) < 1 ? 1 : Number(pageNumber);
    const limit =
      isNaN(recordsPerPage) || recordsPerPage < 1 ? 10 : Number(recordsPerPage);
    const categories = await findCategoriesQuery
      .leftJoinAndSelect('category.createdBy', 'createdBy')
      .leftJoinAndSelect('category.updatedBy', 'updatedBy')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: {
        categories: plainToInstance(Category, categories, {
          excludeExtraneousValues: true,
        }),
        pagination: {
          totalPages,
          totalRecords,
          currentPage: page ?? 1,
          recordsPerPage: limit ?? 10,
        },
      },
    };
  }

  async findOneById(id: string): Promise<CategoryResponseDto> {
    const { data: category } = await this.findOneBy({
      where: { id },
      relations: ['createdBy', 'updatedBy'],
    });
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
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
    const { data: category } = (await this.findOneById(id)) ?? {};
    if (!isUserAdmin(currUser) && category.createdBy.id !== currUser.id) {
      throw new CustomForbiddenException({
        messages: ['You cannot update a category that you did not create'],
      });
    }
    category.updatedBy = currUser;
    Object.assign(category, updateCategoryData);
    const categoryRes = await this.categoryRepository.save(category);
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: categoryRes,
    };
  }

  async remove(id: string, currUser: User): Promise<CategoryResponseDto> {
    const { data: category } = (await this.findOneById(id)) ?? {};

    if (!isUserAdmin(currUser) && category.createdBy.id !== currUser.id) {
      throw new CustomForbiddenException({
        messages: ['You cannot delete a category that you did not create'],
      });
    }
    await this.categoryRepository.delete(id);
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: category,
    };
  }

  private async findOneBy(
    whereCondition: FindOneOptions<Category>,
    queryRunner?: QueryRunner,
  ): Promise<CategoryResponseDto> {
    let category: Category;
    if (!!queryRunner) {
      category = await queryRunner.manager.findOne(Category, whereCondition);
    } else {
      category = await this.categoryRepository.findOne(whereCondition);
    }
    if (!category) throw new CustomNotFoundException();
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: plainToInstance(Category, category, {
        excludeExtraneousValues: true,
      }),
    };
  }

  private buildFindCategoriesQuery(
    name?: string,
    description?: string,
    createdBy?: string,
    startDate?: Date,
    endDate?: Date,
    sortBy?: string,
    sortOrder?: any,
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

    const sortColumn = sortBy || 'createdAt';
    const sortOrderValue = sortOrder || 'DESC';

    query.orderBy(`category.${sortColumn}`, sortOrderValue);

    return query;
  }
}
