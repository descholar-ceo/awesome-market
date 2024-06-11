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
  Patch,
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { CommonErrorResponseDto } from '@/common/common.dtos';

@ApiTags('orders')
@UseGuards(AuthGuard, RolesGuard)
@Controller('orders')
@ApiBearerAuth('Authorization')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles([ADMIN_ROLE_NAME, BUYER_ROLE_NAME])
  @Post()
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'It uses createReviewDto passed as request body to create a order',
  })
  @ApiResponse({
    status: statusCodes.CREATED,
    description: 'Created order details',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
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
  create(
    @Body() createOrderDto: CreateOrderDto[],
    @CurrentUser() currUser: User,
  ): Promise<OrderResponseDto> {
    return this.orderService.create(createOrderDto, currUser);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Get()
  @ApiOperation({
    summary: 'Find all orders with filters',
    description: 'It uses filters to fetch all orders, alongside pagination',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Orders list with pagination',
    type: OrdersResponseDto,
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
  async findWithFilters(
    @Query() filters: FindOrderFiltersDto,
  ): Promise<OrdersResponseDto> {
    return await this.orderService.findWithFilters(filters);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Get(':id')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Find order details',
    description: 'It uses orderId passed as a param to fetch orders details',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Order details',
    type: OrderResponseDto,
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
  async findById(@Param('id') id: string): Promise<OrderResponseDto> {
    return await this.orderService.findById(id);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Patch(':id/update-status')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Update order',
    description:
      'It uses orderId passed as a param and updateStatusData to update order status',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Updated Order details',
    type: OrderResponseDto,
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
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateStatusData: UpdateOrderStatusDto,
    @CurrentUser() currUser: User,
  ): Promise<OrderResponseDto> {
    return this.orderService.update(id, updateStatusData, currUser);
  }
}
