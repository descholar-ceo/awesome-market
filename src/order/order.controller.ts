import { CurrentUser } from '@/decorators/current-user/current-user.decorator';
import { Roles } from '@/decorators/roles/roles.decorator';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import {
  ADMIN_ROLE_NAME,
  BUYER_ROLE_NAME,
  SELLER_ROLE_NAME,
} from '@/role/role.constants';
import { User } from '@/user/entities/user.entity';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  FindOrderFiltersDto,
  OrderResponseDto,
  OrdersResponseDto,
} from './dto/find-order.dto';
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
}
