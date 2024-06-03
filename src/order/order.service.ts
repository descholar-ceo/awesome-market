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
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  FindOrderFiltersDto,
  OrderResponseDto,
  OrdersResponseDto,
} from './dto/find-order.dto';
import { Order } from './entities/order.entity';
import { getDateInterval } from '@/common/utils/dates.utils';

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

  async findWithFilters(
    filters: FindOrderFiltersDto,
  ): Promise<OrdersResponseDto> {
    const {
      createdFromDate,
      createdToDate,
      buyerId,
      pageNumber,
      recordsPerPage,
      sortBy,
      sortOrder,
      code,
    } = filters;
    const { startDate, endDate } = getDateInterval(
      createdFromDate,
      createdToDate,
    );
    const findOrdersQuery = this.buildFindProductsQuery(
      buyerId,
      startDate,
      endDate,
      sortBy,
      sortOrder?.toUpperCase(),
      code,
    );

    const totalRecords = await findOrdersQuery.getCount();
    if (totalRecords === 0) {
      return {
        status: statusCodes.NOT_FOUND,
        message: 'No records found',
      };
    }
    const page =
      isNaN(pageNumber) || Number(pageNumber) < 1 ? 1 : Number(pageNumber);
    const limit =
      isNaN(recordsPerPage) || recordsPerPage < 1 ? 10 : Number(recordsPerPage);
    const orders = await findOrdersQuery
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.inventory', 'inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      status: statusCodes.OK,
      message: statusNames.OK,
      data: {
        orders: plainToInstance(Order, orders, {
          excludeExtraneousValues: true,
        }),
        pagination: {
          totalPages,
          totalRecords,
          currentPage: page ?? 1,
          recordsPerPage: limit ?? 10,
        },
      },
    };
  }

  private buildFindProductsQuery(
    buyerId?: string,
    startDate?: Date,
    endDate?: Date,
    sortBy?: string,
    sortOrder?: any,
    code?: string,
  ): SelectQueryBuilder<Order> {
    const query = this.orderRepository.createQueryBuilder('order');

    if (buyerId) {
      query.andWhere('order.buyer.id = :buyerId', { buyerId });
    }

    if (code) {
      query.andWhere('order.code.id = :code', { code });
    }

    if (startDate) {
      query.andWhere('order.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('order.createdAt <= :endDate', { endDate });
    }

    const sortColumn = sortBy || 'createdAt';
    const sortOrderValue = sortOrder || 'DESC';

    query.orderBy(`order.${sortColumn}`, sortOrderValue);

    return query;
  }
}
