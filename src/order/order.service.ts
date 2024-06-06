import { orderStatuses, paymentStatuses } from './order.constants';
import { PRODUCTION } from '@/common/constants.common';
import { getDateInterval } from '@/common/utils/dates.utils';
import { statusCodes, statusNames } from '@/common/utils/status.utils';
import { ConfigService } from '@/config/config.service';
import { API_URL, APP_MAILING_ADDRESS, NODE_ENV } from '@/config/config.utils';
import { InventoryService } from '@/inventory/inventory.service';
import { MailService } from '@/mail/mail.service';
import { OrderItemService } from '@/order-item/order-item.service';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
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
import { prepareOrderPendingNotificationEmailBody } from './order.utils';
import { UpdateOrderDto } from './dto/update-order.dto';
import { isUserAdmin } from '@/user/user.utils';

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
    private readonly mailService: MailService,
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
          await this.inventoryService.findOneByIdWithoutAssociations(
            inventoryId,
            queryRunner,
          )
        )?.data;
        if (inventory?.quantity < quantity) {
          return {
            status: statusCodes.BAD_REQUEST,
            message: `The ordered quantity is greater than the available stock`,
          };
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
      const createdOrder = (await this.findById(newOrder.id))?.data;
      if (!!createdOrder) {
        const { html, text } = await prepareOrderPendingNotificationEmailBody({
          order: createdOrder,
          apiUrl: this.config.get<string>(API_URL),
        });
        await this.mailService.sendEmail({
          fromEmailAddress: this.config.get<string>(APP_MAILING_ADDRESS),
          emailSubject: `[Action Required]: Your Order Confirmation - ${createdOrder.code}`,
          emailHtmlBody: html,
          emailTextBody: text,
          personalizations: [{ to: { email: createdOrder.buyer.email } }],
        });
      }
      return {
        status: statusCodes.CREATED,
        message: `${statusNames.CREATED}: We have sent you an email that contains payment info`,
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
      status,
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
      status,
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

  async findById(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'buyer',
        'buyer.roles',
        'orderItems',
        'orderItems.inventory.product',
        'orderItems.inventory.owner',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return {
      status: statusCodes.OK,
      message: statusNames.OK,
      data: plainToInstance(Order, order, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async update(
    id: string,
    updateOrderData: UpdateOrderDto,
    currUser: User,
  ): Promise<OrderResponseDto> {
    const order = (await this.findById(id))?.data;
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    if (
      !isUserAdmin(currUser) &&
      order.buyer?.id !== currUser.id &&
      !order.orderItems?.some(
        (currItem) => currItem.inventory.owner.id === currUser.id,
      )
    ) {
      throw new ForbiddenException('You are not allowed to update this order');
    }
    if (
      updateOrderData.status === orderStatuses.SHIPPING &&
      order.paymentStatus !== paymentStatuses.PAID
    ) {
      throw new ForbiddenException(
        'You cannot ship this order, because it is not paid yet',
      );
    }
    if (
      updateOrderData.status === orderStatuses.SHIPPING &&
      order.status !== orderStatuses.PROCESSING
    ) {
      throw new ForbiddenException(
        'You cannot ship this order, because it is not in PROCESSING status',
      );
    }
    if (
      updateOrderData.status === orderStatuses.DELIVERED &&
      order.status !== orderStatuses.SHIPPING
    ) {
      throw new ForbiddenException(
        'You cannot mark this order as DELIVERED, because it was not in SHIPPING status',
      );
    }
    order.updatedBy = currUser;
    Object.assign(order, updateOrderData);
    const updatedOrder = await this.orderRepository.save(order);

    if (!!updatedOrder) {
      return {
        status: statusCodes.OK,
        message: statusNames.OK,
        data: updatedOrder,
      };
    } else {
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        message: statusNames.INTERNAL_SERVER_ERROR,
      };
    }
  }

  private buildFindProductsQuery(
    buyerId?: string,
    startDate?: Date,
    endDate?: Date,
    sortBy?: string,
    sortOrder?: any,
    code?: string,
    status?: string,
  ): SelectQueryBuilder<Order> {
    const query = this.orderRepository.createQueryBuilder('order');

    if (buyerId) {
      query.andWhere('order.buyer.id = :buyerId', { buyerId });
    }

    if (code) {
      query.andWhere('order.code = :code', { code });
    }

    if (status) {
      query.andWhere('order.status = :status', { status });
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
