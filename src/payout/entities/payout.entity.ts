import { Order } from '@/order/entities/order.entity';
import { paymentStatuses } from '@/order/order.constants';
import { User } from '@/user/entities/user.entity';
import { Expose } from 'class-transformer';
import { BeforeInsert, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

export class Payout {
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
  processedAt: Date;

  @Column()
  @Expose()
  status: paymentStatuses;

  @Column()
  @Expose()
  amount: number;

  @ManyToOne(() => Order, (order) => order.payouts)
  @Expose()
  order: Order;

  @ManyToOne(() => User, (seller) => seller.payouts)
  @Expose()
  seller: User;

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
  }
}
