import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ProductResponseDto } from './dto/find-product.dto';
import { User } from '@/user/entities/user.entity';
import { CategoryService } from '@/category/category.service';
import { statusCodes, statusNames } from '@/common/utils/status.utils';
import { plainToInstance } from 'class-transformer';

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
    const category = (await this.categoryService.findById(categoryId))?.data;
    if (!category) throw new NotFoundException('Category not found');
    const newProduct = this.productRepository.create(createProductData);
    newProduct.category = category;
    newProduct.createdBy = currUser;
    newProduct.updatedBy = currUser;
    const savedProduct = await this.productRepository.save(newProduct);
    return {
      status: statusCodes.CREATED,
      message: statusNames.CREATED,
      data: plainToInstance(Product, savedProduct, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async findAll() {
    return await this.productRepository.find();
  }

  async findOne(id: string) {
    return await this.productRepository.findBy({ id });
  }

  async update(id: string, updateProductData: UpdateProductDto) {
    const product = await this.productRepository.findBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    Object.assign(product, updateProductData);
    return await this.productRepository.save(product);
  }

  async remove(id: string) {
    await this.productRepository.delete(id);
  }
}
