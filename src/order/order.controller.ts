import { CurrentUser } from '@/decorators/current-user/current-user.decorator';
import { Roles } from '@/decorators/roles/roles.decorator';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { ValidateIdFromParam } from '@/pipes/validate-uuid/validate-id-param';
import {
  ADMIN_ROLE_NAME,
  BUYER_ROLE_NAME,
  SELLER_ROLE_NAME,
} from '@/role/role.constants';
import { User } from '@/user/entities/user.entity';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  FindOrderFiltersDto,
  OrderResponseDto,
  OrdersResponseDto,
} from './dto/find-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@UseGuards(AuthGuard, RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles([ADMIN_ROLE_NAME, BUYER_ROLE_NAME])
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto[],
    @CurrentUser() currUser: User,
  ): Promise<OrderResponseDto> {
    return this.orderService.create(createOrderDto, currUser);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Get()
  async findWithFilters(
    @Query() filters: FindOrderFiltersDto,
  ): Promise<OrdersResponseDto> {
    return await this.orderService.findWithFilters(filters);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Get(':id')
  @UsePipes(new ValidateIdFromParam())
  findById(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Get(':id/update-status')
  @UsePipes(new ValidateIdFromParam())
  async startShip(
    @Param('id') id: string,
    @Query('status') statusData: UpdateOrderStatusDto,
    @CurrentUser() currUser: User,
  ): Promise<OrderResponseDto> {
    return this.orderService.update(id, statusData, currUser);
  }
}
