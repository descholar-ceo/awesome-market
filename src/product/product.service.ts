import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductData: CreateProductDto) {
    const newProduct = this.productRepository.create(createProductData);
    return await this.productRepository.save(newProduct);
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
