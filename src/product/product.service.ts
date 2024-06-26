import { CategoryService } from '@/category/category.service';
import {
  CustomForbiddenException,
  CustomNotFoundException,
} from '@/common/exception/custom.exception';
import { getDateInterval } from '@/common/utils/dates.utils';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { User } from '@/user/entities/user.entity';
import { isUserAdmin } from '@/user/user.utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import {
  FindProductFiltersDto,
  ProductResponseDto,
  ProductsResponseDto,
} from './dto/find-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoryService: CategoryService,
  ) {}

  async create(
    createProductData: CreateProductDto,
    currUser: User,
  ): Promise<ProductResponseDto> {
    const { categoryId } = createProductData;
    const { data: category } =
      (await this.categoryService.findOneById(categoryId)) ?? {};
    const newProduct = this.productRepository.create(createProductData);
    newProduct.category = category;
    newProduct.createdBy = currUser;
    newProduct.updatedBy = currUser;
    const savedProduct = await this.productRepository.save(newProduct);
    return {
      status: statusCodes.CREATED,
      message: statusMessages.CREATED,
      data: plainToInstance(Product, savedProduct, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async findWithFilters(
    filters: FindProductFiltersDto,
  ): Promise<ProductsResponseDto> {
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
      categoryId,
      code,
      minUnitPrice,
      maxUnitPrice,
    } = filters;
    const { startDate, endDate } = getDateInterval(
      createdFromDate,
      createdToDate,
    );
    const minPrice =
      !!minUnitPrice && isNaN(minUnitPrice) ? 1 : Number(minUnitPrice);
    const maxPrice =
      !!maxUnitPrice && isNaN(maxUnitPrice) ? 1 : Number(maxUnitPrice);
    const findProductsQuery = this.buildFindProductsQuery(
      name,
      description,
      createdBy,
      startDate,
      endDate,
      sortBy,
      sortOrder?.toUpperCase(),
      categoryId,
      code,
      minPrice,
      maxPrice,
    );

    const totalRecords = await findProductsQuery.getCount();
    if (totalRecords === 0) {
      throw new CustomNotFoundException({ messages: ['No records found'] });
    }
    const page =
      isNaN(pageNumber) || Number(pageNumber) < 1 ? 1 : Number(pageNumber);
    const limit =
      isNaN(recordsPerPage) || recordsPerPage < 1 ? 10 : Number(recordsPerPage);
    const products = await findProductsQuery
      .leftJoinAndSelect('product.createdBy', 'createdBy')
      .leftJoinAndSelect('product.updatedBy', 'updatedBy')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventories', 'inventories')
      .leftJoinAndSelect('inventories.owner', 'inventoryOwner')
      .leftJoinAndSelect('inventories.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.order', 'order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('product.reviews', 'reviews')
      .leftJoinAndSelect('reviews.ratedBy', 'ratedBy')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: {
        products: plainToInstance(Product, products, {
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

  async findById(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'createdBy',
        'updatedBy',
        'category',
        'inventories',
        'reviews',
        'inventories.orderItems.order',
        'inventories.orderItems.order.buyer',
      ],
    });

    if (!product) {
      throw new CustomNotFoundException({ messages: [`Product Not Found`] });
    }

    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: plainToInstance(Product, product, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async update(
    id: string,
    updateProductData: UpdateProductDto,
    currUser: User,
  ): Promise<ProductResponseDto> {
    const { data: product } = (await this.findById(id)) ?? {};

    if (!isUserAdmin(currUser) && product.createdBy.id !== currUser.id) {
      throw new CustomForbiddenException({
        messages: ['You cannot update a product that you did not create'],
      });
    }
    const { categoryId, ...updatedData } = updateProductData;
    if (!!updateProductData.categoryId) {
      const { data: category } =
        (await this.categoryService.findOneById(categoryId)) ?? {};
      product.category = category;
    }
    Object.assign(product, { ...updatedData });
    product.updatedBy = currUser;
    const data = await this.productRepository.save(product);
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data,
    };
  }

  async remove(id: string, currUser: User): Promise<ProductResponseDto> {
    const { data: product } = (await this.findById(id)) ?? {};
    if (!isUserAdmin(currUser) && product.createdBy.id !== currUser.id) {
      throw new CustomForbiddenException({
        messages: ['You cannot delete a product that you did not create'],
      });
    }
    await this.productRepository.delete(id);

    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: product,
    };
  }

  private buildFindProductsQuery(
    name?: string,
    description?: string,
    createdBy?: string,
    startDate?: Date,
    endDate?: Date,
    sortBy?: string,
    sortOrder?: any,
    categoryId?: string,
    code?: string,
    minUnitPrice?: number,
    maxUnitPrice?: number,
  ): SelectQueryBuilder<Product> {
    const query = this.productRepository.createQueryBuilder('product');

    if (name) {
      query.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }

    if (description) {
      query.andWhere('product.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (createdBy) {
      query.andWhere('product.createdBy.id = :createdBy', { createdBy });
    }

    if (categoryId) {
      query.andWhere('product.categoryId.id = :categoryId', { categoryId });
    }

    if (code) {
      query.andWhere('product.code.id = :code', { code });
    }

    if (startDate) {
      query.andWhere('product.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('product.createdAt <= :endDate', { endDate });
    }

    if (minUnitPrice) {
      query.andWhere('product.unitPrice >= :minUnitPrice', { minUnitPrice });
    }

    if (maxUnitPrice) {
      query.andWhere('product.unitPrice <= :maxUnitPrice', { maxUnitPrice });
    }

    const sortColumn = sortBy || 'createdAt';
    const sortOrderValue = sortOrder || 'DESC';

    query.orderBy(`product.${sortColumn}`, sortOrderValue);

    return query;
  }
}
