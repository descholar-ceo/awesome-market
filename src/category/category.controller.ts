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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CurrentUser } from '@/decorators/current-user/current-user.decorator';
import { User } from '@/user/entities/user.entity';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { Roles } from '@/decorators/roles/roles.decorator';
import { ADMIN_ROLE_NAME, SELLER_ROLE_NAME } from '@/role/role.constants';

@UseGuards(AuthGuard, RolesGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() currUser: User,
  ) {
    return this.categoryService.create(createCategoryDto, currUser);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
