import { prepareUniqueCode } from '@/common/utils/strings.utils';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { Product } from '@/product/entities/product.entity';
import { User } from '@/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

@Entity()
export class Inventory {
  @PrimaryColumn()
  @Expose()
  @ApiProperty()
  id: string;

  @Column()
  @Expose()
  @ApiProperty()
  quantity: number;

  @Column()
  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Column()
  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Column({ unique: true })
  @Expose()
  @ApiProperty()
  code: string;

  @ManyToOne(() => User, (user) => user.inventories)
  @Expose()
  @ApiProperty({ type: () => User })
  owner: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  @Expose()
  @ApiProperty({ type: () => User })
  updatedBy: User;

  @ManyToOne(() => Product, (product) => product.inventories)
  @Expose()
  @ApiProperty({ type: () => Product })
  product: Product;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.inventory)
  @Expose()
  @ApiProperty({ type: [OrderItem] })
  orderItems: OrderItem[];

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
    this.code = prepareUniqueCode(this.owner.firstName, {
      name: this.product.name,
    });
  }
}
