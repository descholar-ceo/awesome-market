import { CommonResponseDto } from '@/common/common.dtos';
import { CurrentUser } from '@/decorators/current-user/current-user.decorator';
import { Roles } from '@/decorators/roles/roles.decorator';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { ValidateIdFromParam } from '@/pipes/validate-uuid/validate-id-param';
import { ADMIN_ROLE_NAME, SELLER_ROLE_NAME } from '@/role/role.constants';
import { User } from '@/user/entities/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import {
  FindProductFiltersDto,
  ProductsResponseDto,
} from './dto/find-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@UseGuards(AuthGuard, RolesGuard)
@Controller('products')
@ApiBearerAuth('Authorization')
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

  @Get()
  async findWithFilters(
    @Query() filters: FindProductFiltersDto,
  ): Promise<ProductsResponseDto> {
    return await this.productService.findWithFilters(filters);
  }

  @Get(':id')
  @UsePipes(new ValidateIdFromParam())
  findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Patch(':id')
  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateProductDto,
    @CurrentUser() currUser: User,
  ) {
    return this.productService.update(id, updateCategoryDto, currUser);
  }

  @Delete(':id')
  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
  async remove(
    @Param('id') id: string,
    @CurrentUser() currUser: User,
  ): Promise<CommonResponseDto> {
    return this.productService.remove(id, currUser);
  }
}
