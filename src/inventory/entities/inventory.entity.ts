import { prepareUniqueCode } from '@/common/utils/strings.utils';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { Product } from '@/product/entities/product.entity';
import { User } from '@/user/entities/user.entity';
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
  id: string;

  @Column()
  @Expose()
  quantity: number;

  @Column()
  @Expose()
  createdAt: Date;

  @Column()
  @Expose()
  updatedAt: Date;

  @Column({ unique: true })
  @Expose()
  code: string;

  @ManyToOne(() => User, (user) => user.inventories)
  @Expose()
  owner: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  @Expose()
  updatedBy: User;

  @ManyToOne(() => Product, (product) => product.inventories)
  @Expose()
  product: Product;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.inventory)
  @Expose()
  orderItems: OrderItem[];

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
    this.code = prepareUniqueCode(this.owner.firstName, {
      name: this.product.name,
    });
  }
}
