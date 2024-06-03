import { PRODUCTION } from '@/common/constants.common';
import { ConfigService } from '@/config/config.service';
import { NODE_ENV } from '@/config/config.utils';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly config: ConfigService,
  ) {}
  async create(
    createOrderItemData: CreateOrderItemDto,
    queryRunner?: QueryRunner,
  ): Promise<OrderItem> {
    const { inventory, order, quantity } = createOrderItemData;
    let createdOrderItem: OrderItem = this.orderItemRepository.create({
      inventory,
      order,
      quantity,
    });
    try {
      if (
        createOrderItemData?.order?.id &&
        createOrderItemData?.inventory?.id
      ) {
        if (!!queryRunner) {
          createdOrderItem = await queryRunner.manager.save(createdOrderItem);
        } else {
          createdOrderItem =
            await this.orderItemRepository.save(createdOrderItem);
        }
        return createdOrderItem;
      } else {
        throw new BadRequestException(
          'Order Id missing or Inventory Id missing',
        );
      }
    } catch (err) {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.error(err);
      }
      return null;
    }
  }
}
