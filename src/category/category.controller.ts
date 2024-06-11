import { CommonErrorResponseDto } from '@/common/common.dtos';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { CurrentUser } from '@/decorators/current-user/current-user.decorator';
import { Roles } from '@/decorators/roles/roles.decorator';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { ValidateUniqueCategoryPipe } from '@/pipes/validate-record-uniqueness/validate-unique-category/validate-unique-category.pipe';
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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  CategoriesResponseDto,
  CategoryResponseDto,
  FindCategoryFiltersDto,
} from './dto/find-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@UseGuards(AuthGuard, RolesGuard)
@Controller('categories')
@ApiBearerAuth('Authorization')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Post()
  @ApiOperation({
    summary: 'Create a new category',
    description:
      'It uses createCategoryData passed as request body to create a category',
  })
  @ApiResponse({
    status: statusCodes.CREATED,
    description: 'Created category details',
    type: CategoryResponseDto,
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
    @Body(ValidateUniqueCategoryPipe) createCategoryData: CreateCategoryDto,
    @CurrentUser() currUser: User,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.create(createCategoryData, currUser);
  }

  @Get()
  @ApiOperation({
    summary: 'Find all categories with filters',
    description:
      'It uses filters to fetch all categories, alongside pagination',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Categories list with pagination',
    type: CategoriesResponseDto,
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
    @Query() filters: FindCategoryFiltersDto,
  ): Promise<CategoriesResponseDto> {
    return await this.categoryService.findWithFilters(filters);
  }

  @Get(':id')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Find a category',
    description:
      'It uses category id passed as a parameter to fetch category details',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Category details',
    type: CategoryResponseDto,
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
  async findById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return await this.categoryService.findOneById(id);
  }

  @Patch(':id')
  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Update a category',
    description:
      'It uses categoryId passed as a parameter and updateRoleData passed as request body to update a category',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Category details',
    type: CategoryResponseDto,
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
    @Body(ValidateUniqueCategoryPipe) updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() currUser: User,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.update(id, updateCategoryDto, currUser);
  }

  @Delete(':id')
  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Deletes a category',
    description: 'It uses categoryId passed as a parameter to delete category',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Deleted category details',
    type: CategoryResponseDto,
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
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.remove(id, currUser);
  }
}
