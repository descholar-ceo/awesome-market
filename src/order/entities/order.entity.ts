import { prepareUniqueCode } from '@/common/utils/strings.utils';
import { OrderItem } from '@/order-item/entities/order-item.entity';
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
import { orderStatuses, paymentStatuses } from '../order.constants';
import { Payout } from '@/payout/entities/payout.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Order {
  @PrimaryColumn()
  @Expose()
  @ApiProperty()
  id: string;

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

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'buyer_id' })
  @Expose()
  @ApiProperty({ type: User })
  buyer: User;

  @Column({ enum: orderStatuses })
  @Expose()
  @ApiProperty({ enum: orderStatuses })
  status: orderStatuses;

  @Column({ enum: paymentStatuses })
  @Expose()
  @ApiProperty({ enum: paymentStatuses })
  paymentStatus: paymentStatuses;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  @Expose()
  @ApiProperty({ type: User })
  updatedBy: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  @Expose()
  @ApiProperty({ type: [OrderItem] })
  orderItems: OrderItem[];

  @OneToMany(() => Payout, (payout) => payout.order)
  @Expose()
  @ApiProperty({ type: [Payout] })
  payouts: Payout[];

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
    this.code = prepareUniqueCode(this.buyer.firstName, {
      name: 'order',
    });
  }
}
