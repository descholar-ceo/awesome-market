import { statusCodes, statusNames } from '@/common/utils/status.utils';
import { InventoryService } from '@/inventory/inventory.service';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/find-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { ConfigService } from '@/config/config.service';
import { NODE_ENV } from '@/config/config.utils';
import { PRODUCTION } from '@/common/constants.common';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly inventoryService: InventoryService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async create(
    createOrderData: CreateOrderDto,
    currUser: User,
  ): Promise<OrderResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { inventoryId, quantity } = createOrderData;
      const inventory = (await this.inventoryService.findById(inventoryId))
        ?.data;
      if (!inventory) throw new NotFoundException('Inventory not found');
      if (inventory.quantity < quantity) {
        throw new BadRequestException(
          'Ordered quantity is greater than the inventory',
        );
      }
      const order = await this.orderRepository.create(createOrderData);
      order.inventory = inventory;
      order.buyer = (await this.userService.findById(currUser.id))?.data;
      order.updatedBy = currUser;
      await queryRunner.manager.save(order);
      inventory.quantity -= order.quantity;
      inventory.updatedBy = currUser;
      await this.inventoryService.decreaseInventory(
        inventory.id,
        { quantity: order.quantity },
        currUser,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return {
        status: statusCodes.CREATED,
        message: statusNames.CREATED,
        data: plainToInstance(Order, order, {
          excludeExtraneousValues: true,
        }),
      };
    } catch (err) {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.error(err);
      }
      await queryRunner.rollbackTransaction();
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      };
    } finally {
      await queryRunner.release();
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
