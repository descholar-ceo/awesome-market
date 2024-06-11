import { CommonErrorResponseDto } from '@/common/common.dtos';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { CurrentUser } from '@/decorators/current-user/current-user.decorator';
import { Roles } from '@/decorators/roles/roles.decorator';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { ValidateIdFromParam } from '@/pipes/validate-uuid/validate-id-param';
import { ValidateUuidPipe } from '@/pipes/validate-uuid/validate-uuid';
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryResponseDto } from './dto/find-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('inventories')
@UseGuards(AuthGuard, RolesGuard)
@Controller('inventories')
@ApiBearerAuth('Authorization')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Post()
  @ApiOperation({
    summary: 'Create a new inventory',
    description:
      'It uses createInventoryData passed as request body to create a new inventory or increase its quantity if it already exists',
  })
  @ApiResponse({
    status: statusCodes.CREATED,
    description: 'Created inventory details',
    type: InventoryResponseDto,
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
  async createOrIncrease(
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
  @ApiOperation({
    summary: 'Increase inventory quantity',
    description: 'It updates inventory quantity by increasing it',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Updated Inventory',
    type: InventoryResponseDto,
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
  async increaseInventory(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @CurrentUser() currUser: User,
  ): Promise<InventoryResponseDto> {
    return await this.inventoryService.increaseInventory(
      id,
      updateInventoryDto,
      currUser,
    );
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Patch('/decrease-inventory/:id')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Decrease inventory quantity',
    description: 'It updates inventory quantity by decreasing it',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Updated Inventory',
    type: InventoryResponseDto,
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
  @ApiOperation({
    summary: 'Deletes an inventory',
    description:
      'It uses inventoryId passed as a parameter to delete inventory',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Deleted inventory details',
    type: InventoryResponseDto,
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
  ): Promise<InventoryResponseDto> {
    return this.inventoryService.remove(id, currUser);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Get(':id')
  @UsePipes(new ValidateUuidPipe())
  @ApiOperation({
    summary: 'Finds an inventory',
    description:
      'It uses inventoryId passed as a parameter to find inventory details',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Inventory details',
    type: InventoryResponseDto,
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
  findById(@Param('id') id: string): Promise<InventoryResponseDto> {
    return this.inventoryService.findOneById(id);
  }
}
