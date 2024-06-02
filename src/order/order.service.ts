import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { InventoryService } from '@/inventory/inventory.service';
import { UserService } from '@/user/user.service';
import { User } from '@/user/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { statusCodes, statusNames } from '@/common/utils/status.utils';
import { OrderResponseDto } from './dto/find-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly inventoryService: InventoryService,
    private readonly userService: UserService,
  ) {}

  async create(
    createOrderData: CreateOrderDto,
    currUser: User,
  ): Promise<OrderResponseDto> {
    const { inventoryId, quantity } = createOrderData;
    const inventory = (await this.inventoryService.findById(inventoryId))?.data;
    if (!inventory) throw new NotFoundException('Inventory not found');
    if (inventory.quantity < quantity) {
      throw new BadRequestException(
        'Ordered quantity is greater than the inventory',
      );
    } else {
      const order = await this.orderRepository.create(createOrderData);
      order.inventory = inventory;
      order.buyer = (await this.userService.findById(currUser.id))?.data;
      order.updatedBy = currUser;
      const savedOrder = await this.orderRepository.save(order);
      if (!!savedOrder) {
        inventory.quantity -= order.quantity;
        inventory.updatedBy = currUser;
        const savedInventory = await this.inventoryService.decreaseInventory(
          inventory.id,
          { quantity: order.quantity },
          currUser,
        );
        if (!!savedInventory?.data) {
          return {
            status: statusCodes.CREATED,
            message: statusNames.CREATED,
            data: plainToInstance(Order, savedOrder, {
              excludeExtraneousValues: true,
            }),
          };
        }
      }
    }
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
