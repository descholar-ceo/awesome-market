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
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryService } from './inventory.service';
import { CurrentUser } from '@/decorators/current-user/current-user.decorator';
import { User } from '@/user/entities/user.entity';
import { InventoryResponseDto } from './dto/find-inventory.dto';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { Roles } from '@/decorators/roles/roles.decorator';
import { ADMIN_ROLE_NAME, SELLER_ROLE_NAME } from '@/role/role.constants';

@UseGuards(AuthGuard, RolesGuard)
@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Post()
  async create(
    @Body() createInventoryDto: CreateInventoryDto,
    @CurrentUser() currUser: User,
  ): Promise<InventoryResponseDto> {
    return await this.inventoryService.create(createInventoryDto, currUser);
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }
}
