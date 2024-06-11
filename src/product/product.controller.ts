import { CommonErrorResponseDto } from '@/common/common.dtos';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import {
  FindProductFiltersDto,
  ProductResponseDto,
  ProductsResponseDto,
} from './dto/find-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@ApiTags('products')
@UseGuards(AuthGuard, RolesGuard)
@Controller('products')
@ApiBearerAuth('Authorization')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Post()
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'It uses createProductData passed as request body to create a product',
  })
  @ApiResponse({
    status: statusCodes.CREATED,
    description: 'Created product details',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.FORBIDDEN,
    description: statusMessages.FORBIDDEN,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  async create(
    @Body() createProductData: CreateProductDto,
    @CurrentUser() currUser: User,
  ): Promise<ProductResponseDto> {
    return await this.productService.create(createProductData, currUser);
  }

  @Get()
  @ApiOperation({
    summary: 'Find all products with filters',
    description: 'It uses filters to fetch all products, alongside pagination',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Products list with pagination',
    type: ProductsResponseDto,
  })
  @ApiResponse({
    status: statusCodes.NOT_FOUND,
    description: statusMessages.NOT_FOUND,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  async findWithFilters(
    @Query() filters: FindProductFiltersDto,
  ): Promise<ProductsResponseDto> {
    return await this.productService.findWithFilters(filters);
  }

  @Get(':id')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Find a product',
    description:
      'It uses product id passed as a parameter to fetch product details',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Product details',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: statusCodes.NOT_FOUND,
    description: statusMessages.NOT_FOUND,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
    type: CommonErrorResponseDto,
  })
  async findById(@Param('id') id: string): Promise<ProductResponseDto> {
    return await this.productService.findById(id);
  }

  @Patch(':id')
  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Update a product',
    description:
      'It uses productId passed as a parameter and updateRoleData passed as request body to update a product',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Product details',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: statusCodes.NOT_FOUND,
    description: statusMessages.NOT_FOUND,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.FORBIDDEN,
    description: statusMessages.FORBIDDEN,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.CONFLICT,
    description: statusMessages.CONFLICT,
    type: CommonErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() currUser: User,
  ): Promise<ProductResponseDto> {
    return await this.productService.update(id, updateProductDto, currUser);
  }

  @Delete(':id')
  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Deletes a product',
    description: 'It uses productId passed as a parameter to delete product',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Deleted product details',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: statusCodes.NOT_FOUND,
    description: statusMessages.NOT_FOUND,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.FORBIDDEN,
    description: statusMessages.FORBIDDEN,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
    type: CommonErrorResponseDto,
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currUser: User,
  ): Promise<ProductResponseDto> {
    return await this.productService.remove(id, currUser);
  }
}
