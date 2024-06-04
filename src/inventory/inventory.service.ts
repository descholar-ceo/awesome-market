import { CommonResponseDto } from '@/common/common.dtos';
import { statusCodes, statusNames } from '@/common/utils/status.utils';
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
import { QueryRunner, Repository } from 'typeorm';
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
    let message: string = statusNames.CREATED;
    if (!!inventory) {
      inventory.quantity += quantity;
      inventory.updatedBy = currUser;
      status = statusCodes.OK;
      message = statusNames.OK;
    } else {
      inventory = await this.inventoryRepository.create(createInventoryData);
      inventory.product = product;
      inventory.owner = (await this.userService.findById(currUser.id))?.data;
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

  async findById(
    id: string,
    queryRunner?: QueryRunner,
  ): Promise<InventoryResponseDto> {
    let inventory: Inventory;
    const findCondition = { where: { id } };
    if (!!queryRunner) {
      inventory = await queryRunner.manager.findOne(Inventory, findCondition);
    } else {
      inventory = await this.inventoryRepository.findOne(findCondition);
    }
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return {
      status: statusCodes.OK,
      message: statusNames.OK,
      data: plainToInstance(Inventory, inventory, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async findByOne(
    id: string,
    queryRunner?: QueryRunner,
  ): Promise<InventoryResponseDto> {
    let inventory: Inventory;
    const findCondition = {
      where: { id },
      relations: ['owner', 'product', 'orderItems', 'orderItems.order'],
    };
    if (!!queryRunner) {
      inventory = await queryRunner.manager.findOne(Inventory, findCondition);
    } else {
      inventory = await this.inventoryRepository.findOne(findCondition);
    }
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return {
      status: statusCodes.OK,
      message: statusNames.OK,
      data: plainToInstance(Inventory, inventory, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async increaseInventory(
    id: string,
    updateInventoryData: UpdateInventoryDto,
    currUser: User,
  ): Promise<InventoryResponseDto> {
    const inventory = (await this.findByOne(id))?.data;
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    if (!isUserAdmin(currUser) && inventory.owner.id !== currUser.id) {
      throw new ForbiddenException(
        'You cannot add items to an inventory that you do not own',
      );
    }
    let affectedRows: number;
    inventory.updatedBy = currUser;
    inventory.quantity += updateInventoryData.quantity;
    const { affected } = await this.inventoryRepository.update(id, inventory);
    if (!!affected || !!affectedRows) {
      return await this.findById(id);
    }
    return {
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: 'Nothing added',
    };
  }

  async decreaseInventory(
    id: string,
    updateInventoryData: UpdateInventoryDto,
    currUser: User,
    queryRunner?: QueryRunner,
  ): Promise<InventoryResponseDto> {
    const inventory = (await this.findById(id))?.data;
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
    let affectedRows: number;
    if (!!queryRunner) {
      const { affected } = await queryRunner.manager.update(
        Inventory,
        { id: inventory.id },
        inventory,
      );
      affectedRows = affected;
    } else {
      const { affected } = await this.inventoryRepository.update(id, inventory);
      affectedRows = affected;
    }
    if (!!affectedRows) {
      return await this.findById(id);
    }
    return {
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: 'Nothing added',
    };
  }

  async remove(id: string, currUser: User): Promise<CommonResponseDto> {
    const inventory = await this.findById(id);
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    if (!isUserAdmin(currUser) && inventory.data.owner.id !== currUser.id) {
      throw new ForbiddenException(
        'You cannot delete a inventory that you do not own',
      );
    }
    const { affected } = await this.inventoryRepository.delete(id);
    if (!!affected) {
      return { status: statusCodes.OK, message: statusNames.OK };
    }
    return {
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong, try again',
    };
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
}
