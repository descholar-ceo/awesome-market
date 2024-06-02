import { prepareUniqueCode } from '@/common/utils/strings.utils';
import { Inventory } from '@/inventory/entities/inventory.entity';
import { User } from '@/user/entities/user.entity';
import { Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';
import { orderStatuses } from '../order.constants';

@Entity()
export class Order {
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

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'buyer_id' })
  @Expose()
  buyer: User;

  @Column({ enum: orderStatuses })
  @Expose()
  status: orderStatuses;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  @Expose()
  updatedBy: User;

  @ManyToOne(() => Inventory, (inventory) => inventory.orders)
  @Expose()
  inventory: Inventory;

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
    this.code = prepareUniqueCode(this.buyer.firstName, {
      name: this.inventory.product.name,
    });
  }
}
