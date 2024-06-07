import { CommonResponseDto } from '@/common/common.dtos';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { Inventory } from '@/inventory/entities/inventory.entity';
import { ProductService } from '@/product/product.service';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { isUserAdmin } from '@/user/user.utils';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryResponseDto } from './dto/find-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly productService: ProductService,
    private readonly userService: UserService,
  ) {}
  async createOrIncrease(
    createInventoryData: CreateInventoryDto,
    currUser: User,
  ): Promise<InventoryResponseDto> {
    const { productId, quantity } = createInventoryData;
    const product = (await this.productService.findById(productId))?.data;
    if (!product) throw new NotFoundException('Product not found');
    let inventory = (
      await this.findByOwnerIdAndProductId(currUser.id, productId)
    )?.[0];
    let status: number = statusCodes.CREATED;
    let message: string = statusMessages.CREATED;
    if (!!inventory) {
      inventory.quantity += quantity;
      inventory.updatedBy = currUser;
      status = statusCodes.OK;
      message = statusMessages.OK;
    } else {
      inventory = await this.inventoryRepository.create(createInventoryData);
      inventory.product = product;
      inventory.owner = (await this.userService.findOneById(currUser.id))?.data;
      inventory.updatedBy = currUser;
    }
    const savedInventory = await this.inventoryRepository.save(inventory);
    return {
      status,
      message,
      data: plainToInstance(Inventory, savedInventory, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async findOneById(
    id: string,
    queryRunner?: QueryRunner,
  ): Promise<InventoryResponseDto> {
    return await this.findOneBy(
      {
        where: { id },
        relations: ['owner', 'product', 'orderItems', 'orderItems.order'],
      },
      queryRunner,
    );
  }

  async findOneByIdWithoutAssociations(
    id: string,
    queryRunner?: QueryRunner,
  ): Promise<InventoryResponseDto> {
    return await this.findOneBy(
      {
        where: { id },
      },
      queryRunner,
    );
  }

  async increaseInventory(
    id: string,
    updateInventoryData: UpdateInventoryDto,
    currUser: User,
  ): Promise<InventoryResponseDto> {
    const inventory = (await this.findOneById(id))?.data;
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    if (!isUserAdmin(currUser) && inventory.owner.id !== currUser.id) {
      throw new ForbiddenException(
        'You cannot add items to an inventory that you do not own',
      );
    }
    inventory.updatedBy = currUser;
    inventory.quantity += updateInventoryData.quantity;
    const savedInventory = await this.inventoryRepository.save(inventory);
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: savedInventory,
    };
  }

  async decreaseInventory(
    id: string,
    updateInventoryData: UpdateInventoryDto,
    currUser: User,
    queryRunner?: QueryRunner,
  ): Promise<InventoryResponseDto> {
    const inventory = (await this.findOneByIdWithoutAssociations(id))?.data;
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }
    inventory.updatedBy = currUser;
    if (inventory.quantity < updateInventoryData.quantity) {
      throw new BadRequestException('Not enough inventory');
    }
    Object.assign(inventory, {
      quantity: inventory.quantity - updateInventoryData.quantity,
    });
    let savedInventory: Inventory;
    if (!!queryRunner) {
      savedInventory = await queryRunner.manager.save(Inventory, inventory);
    } else {
      savedInventory = await this.inventoryRepository.save(inventory);
    }
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: savedInventory,
    };
  }

  async remove(id: string, currUser: User): Promise<CommonResponseDto> {
    try {
      const inventory = await this.findOneByIdWithoutAssociations(id);
      if (!inventory) {
        throw new NotFoundException(`Inventory with ID ${id} not found`);
      }

      if (!isUserAdmin(currUser) && inventory.data.owner.id !== currUser.id) {
        throw new ForbiddenException(
          'You cannot delete a inventory that you do not own',
        );
      }
      await this.inventoryRepository.delete(id);
      return { status: statusCodes.OK, message: statusMessages.OK };
    } catch (err) {
      throw new IntersectionObserver(err);
    }
  }

  private async findByOwnerIdAndProductId(
    ownerId: string,
    productId: string,
  ): Promise<Inventory[]> {
    return await this.inventoryRepository.find({
      where: {
        owner: { id: ownerId },
        product: { id: productId },
      },
    });
  }

  private async findOneBy(
    whereCondition: FindOneOptions<Inventory>,
    queryRunner: QueryRunner,
  ): Promise<InventoryResponseDto> {
    let inventory: Inventory;
    if (!!queryRunner) {
      inventory = await queryRunner.manager.findOne(Inventory, whereCondition);
    } else {
      inventory = await this.inventoryRepository.findOne(whereCondition);
    }
    if (!inventory) {
      throw new NotFoundException(`Inventory not found`);
    }

    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: plainToInstance(Inventory, inventory, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
