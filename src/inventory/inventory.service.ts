import { statusCodes, statusNames } from '@/common/utils/status.utils';
import { Inventory } from '@/inventory/entities/inventory.entity';
import { ProductService } from '@/product/product.service';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryResponseDto } from './dto/find-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { isUserAdmin } from '@/user/user.utils';

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

  async findById(id: string): Promise<InventoryResponseDto> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['owner', 'updatedBy', 'product'],
    });

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
    const inventory = (await this.findById(id))?.data;
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

  findAll() {
    return `This action returns all inventory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }
}
