import { Inventory } from '@/inventory/entities/inventory.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { User } from '@/user/entities/user.entity';
import { InventoryResponseDto } from './dto/find-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductService } from '@/product/product.service';
import { statusCodes, statusNames } from '@/common/utils/status.utils';
import { plainToInstance } from 'class-transformer';
import { UserService } from '@/user/user.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly productService: ProductService,
    private readonly userService: UserService,
  ) {}
  async create(
    createInventoryData: CreateInventoryDto,
    currUser: User,
  ): Promise<InventoryResponseDto> {
    const { productId } = createInventoryData;
    const product = (await this.productService.findById(productId))?.data;
    if (!product) throw new NotFoundException('Product not found');
    const newInventory = this.inventoryRepository.create(createInventoryData);
    newInventory.product = product;
    newInventory.owner = (await this.userService.findById(currUser.id))?.data;
    newInventory.updatedBy = currUser;
    const savedInventory = await this.inventoryRepository.save(newInventory);
    return {
      status: statusCodes.CREATED,
      message: statusNames.CREATED,
      data: plainToInstance(Inventory, savedInventory, {
        excludeExtraneousValues: true,
      }),
    };
  }

  findAll() {
    return `This action returns all inventory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventory`;
  }

  update(id: number, updateInventoryDto: UpdateInventoryDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }
}
