import { CurrentUser } from '@/decorators/current-user/current-user.decorator';
import { Roles } from '@/decorators/roles/roles.decorator';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { ADMIN_ROLE_NAME, BUYER_ROLE_NAME } from '@/role/role.constants';
import { User } from '@/user/entities/user.entity';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/find-order.dto';
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
}
