import { CommonResponseDto } from '@/common/common.dtos';
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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  CategoryResponseDto,
  FindCategoryFiltersDto,
} from './dto/find-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('categories')
@UseGuards(AuthGuard, RolesGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Post()
  create(
    @Body(ValidateUniqueCategoryPipe) createCategoryDto: CreateCategoryDto,
    @CurrentUser() currUser: User,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.create(createCategoryDto, currUser);
  }

  @Get()
  findWithFilters(@Query() filters: FindCategoryFiltersDto) {
    return this.categoryService.findWithFilters(filters);
  }

  @Get(':id')
  @UsePipes(new ValidateIdFromParam())
  async findById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return await this.categoryService.findOneById(id);
  }

  @Patch(':id')
  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @UsePipes(new ValidateIdFromParam())
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
  async remove(
    @Param('id') id: string,
    @CurrentUser() currUser: User,
  ): Promise<CommonResponseDto> {
    return await this.categoryService.remove(id, currUser);
  }
}
