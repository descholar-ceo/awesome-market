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
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryResponseDto } from './dto/find-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryService } from './inventory.service';
import { ValidateUuidPipe } from '@/pipes/validate-uuid/validate-uuid';

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
    return await this.inventoryService.createOrIncrease(
      createInventoryDto,
      currUser,
    );
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Patch('/increase-inventory/:id')
  @UsePipes(new ValidateIdFromParam())
  increaseInventory(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @CurrentUser() currUser: User,
  ) {
    return this.inventoryService.increaseInventory(
      id,
      updateInventoryDto,
      currUser,
    );
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Patch('/decrease-inventory/:id')
  @UsePipes(new ValidateIdFromParam())
  decreaseInventory(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @CurrentUser() currUser: User,
  ) {
    return this.inventoryService.decreaseInventory(
      id,
      updateInventoryDto,
      currUser,
    );
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Delete(':id')
  @UsePipes(new ValidateIdFromParam())
  async remove(
    @Param('id') id: string,
    @CurrentUser() currUser: User,
  ): Promise<CommonResponseDto> {
    return this.inventoryService.remove(id, currUser);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Get(':id')
  @UsePipes(new ValidateUuidPipe())
  findById(@Param('id') id: string): Promise<InventoryResponseDto> {
    return this.inventoryService.findById(id);
  }
}
