import { PRODUCTION } from '@/common/constants.common';
import { statusCodes, statusNames } from '@/common/utils/status.utils';
import { ConfigService } from '@/config/config.service';
import { NODE_ENV } from '@/config/config.utils';
import { InventoryService } from '@/inventory/inventory.service';
import { OrderItemService } from '@/order-item/order-item.service';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/find-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly inventoryService: InventoryService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private readonly orderItemService: OrderItemService,
  ) {}

  async create(
    createOrderData: CreateOrderDto[],
    currUser: User,
  ): Promise<OrderResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const buyer = (await this.userService.findById(currUser.id, queryRunner))
        ?.data;
      const newOrder = await this.orderRepository.create({
        buyer,
        updatedBy: buyer,
      });
      for (const currData of createOrderData) {
        const { inventoryId, quantity } = currData;
        const inventory = (
          await this.inventoryService.findById(inventoryId, queryRunner)
        )?.data;
        if (inventory?.quantity < quantity) {
          throw new BadRequestException(
            'Ordered quantity is greater than the inventory',
          );
        }
        await queryRunner.manager.save(newOrder);
        const orderItem = await this.orderItemService.create(
          { order: newOrder, inventory, quantity },
          queryRunner,
        );
        if (!!orderItem) {
          await this.inventoryService.decreaseInventory(
            inventory.id,
            { quantity: currData.quantity },
            currUser,
            queryRunner,
          );
        } else {
          throw new InternalServerErrorException('Order Item not created!');
        }
      }
      await queryRunner.commitTransaction();
      return {
        status: statusCodes.CREATED,
        message: statusNames.CREATED,
        data: plainToInstance(Order, newOrder, {
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
}
