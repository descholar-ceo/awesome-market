import {
  dotenvConfig,
  getEnvironmentValue,
  validateEnvironment,
} from './../config/config.utils';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { Roles } from '@/decorators/roles/roles.decorator';
import { ADMIN_ROLE, BUYER_ROLE, SELLER_ROLE } from '@/config/config.utils';

@UseGuards(AuthGuard, RolesGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductData: CreateProductDto) {
    return await this.productService.create(createProductData);
  }

  @Roles([
    getEnvironmentValue<string>(validateEnvironment(dotenvConfig), ADMIN_ROLE),
    getEnvironmentValue<string>(validateEnvironment(dotenvConfig), BUYER_ROLE),
    getEnvironmentValue<string>(validateEnvironment(dotenvConfig), SELLER_ROLE),
  ])
  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
