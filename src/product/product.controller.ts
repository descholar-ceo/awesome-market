import { Roles } from '@/decorators/roles/roles.decorator';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import {
  ADMIN_ROLE_NAME,
  BUYER_ROLE_NAME,
  SELLER_ROLE_NAME,
} from '@/role/role.constants';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';
import { CurrentUser } from '@/decorators/current-user/current-user.decorator';
import { User } from '@/user/entities/user.entity';

@UseGuards(AuthGuard, RolesGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Post()
  async create(
    @Body() createProductData: CreateProductDto,
    @CurrentUser() currUser: User,
  ) {
    return await this.productService.create(createProductData, currUser);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME, BUYER_ROLE_NAME])
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
