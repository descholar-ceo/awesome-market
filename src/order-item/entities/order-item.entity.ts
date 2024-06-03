import { Inventory } from '@/inventory/entities/inventory.entity';
import { Order } from '@/order/entities/order.entity';
import { Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

@Entity()
export class OrderItem {
  @PrimaryColumn()
  @Expose()
  id: string;

  @Column()
  @Expose()
  createdAt: Date;

  @Column()
  @Expose()
  updatedAt: Date;

  @Column()
  @Expose()
  quantity: number;

  @ManyToOne(() => Order, (order) => order.orderItems)
  @Expose()
  order: Order;

  @ManyToOne(() => Inventory, (inventory) => inventory.orderItems)
  @Expose()
  inventory: Inventory;

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
  }
}
