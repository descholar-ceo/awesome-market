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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CurrentUser } from '@/decorators/current-user/current-user.decorator';
import { User } from '@/user/entities/user.entity';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { Roles } from '@/decorators/roles/roles.decorator';
import { BUYER_ROLE_NAME, ADMIN_ROLE_NAME } from '@/role/role.constants';
import { OrderResponseDto } from './dto/find-order.dto';

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

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
