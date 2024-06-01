import { prepareDateInterval } from '@/common/utils/dates.utils';
import { statusCodes, statusNames } from '@/common/utils/status.utils';
import { ConfigService } from '@/config/config.service';
import { User } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  CategoriesResponseDto,
  CategoryResponseDto,
  FindCategoryFiltersDto,
} from './dto/find-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { plainToInstance } from 'class-transformer';

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
    if (!!category) {
      return {
        status: statusCodes.CREATED,
        message: statusNames.CREATED,
        data: category,
      };
    }
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
    } = filters ?? {};
    let startDate, endDate;
    if (!!createdFromDate || !!createdToDate) {
      const { startOfTheDay, endOfTheDay } = prepareDateInterval(
        createdFromDate ? new Date(createdFromDate) : null,
        createdToDate ? new Date(createdToDate) : null,
      );
      startDate = startOfTheDay;
      endDate = endOfTheDay;
    }
    const findCategoriesQuery: SelectQueryBuilder<Category> =
      this.categoryRepository.createQueryBuilder('category');

    if (name) {
      findCategoriesQuery.andWhere('category.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    if (description) {
      findCategoriesQuery.andWhere('category.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (createdBy) {
      findCategoriesQuery.andWhere('category.created_by = :createdBy', {
        createdBy,
      });
    }

    if (startDate) {
      findCategoriesQuery.andWhere('category.createdAt >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      findCategoriesQuery.andWhere('category.createdAt <= :endDate', {
        endDate,
      });
    }
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
    const category = (
      await this.categoryRepository.find({
        where: { id },
        relations: { createdBy: true, updatedBy: true },
      })
    )?.[0];
    if (!!category) {
      return {
        status: statusCodes.OK,
        message: statusNames.OK,
        data: plainToInstance(Category, category, {
          excludeExtraneousValues: true,
        }),
      };
    }
    return { status: statusCodes.NOT_FOUND, message: statusNames.NOT_FOUND };
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
