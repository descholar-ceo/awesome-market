import { Category } from '@/category/entities/category.entity';
import { Inventory } from '@/inventory/entities/inventory.entity';
import { Order } from '@/order/entities/order.entity';
import { Product } from '@/product/entities/product.entity';
import { Role } from '@/role/entities/role.entity';
import { ADMIN_ROLE_NAME, BUYER_ROLE_NAME } from '@/role/role.constants';
import * as bcrypt from 'bcryptjs';
import { Exclude, Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';
import { DEFAULT_SHIPPING_ADDRESS_VALUE } from '../user.constants';
import { Payout } from '@/payout/entities/payout.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryColumn()
  @Expose()
  @ApiProperty()
  id: string;

  @Column({ unique: true })
  @Expose()
  @ApiProperty()
  email: string;

  @Column({ unique: true })
  @Expose()
  @ApiProperty()
  phoneNumber: string;

  @Column()
  @Exclude()
  @ApiProperty()
  password: string;

  @Column()
  @Expose()
  @ApiProperty()
  firstName: string;

  @Column()
  @Expose()
  @ApiProperty()
  lastName: string;

  @Column({ default: true })
  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Column()
  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Column()
  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Column({ nullable: true })
  @Expose()
  @ApiProperty()
  shippingAddress?: string;

  @Column()
  @Expose()
  @ApiProperty()
  stripeAccountId?: string;

  @Column({ default: 'rwf' })
  @Expose()
  @ApiProperty()
  currency: string;

  // RELATIONS
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  @Expose()
  @ApiProperty({ type: [Role] })
  roles: Role[];

  @OneToMany(() => Category, (category) => category.createdBy)
  @Expose()
  @ApiProperty({ type: [Category] })
  createdCategories: Category[];

  @OneToMany(() => Category, (category) => category.updatedBy)
  @Expose()
  @ApiProperty({ type: [Category] })
  updatedCategories: Category[];

  @OneToMany(() => Product, (product) => product.createdBy)
  @Expose()
  @ApiProperty({ type: [Product] })
  createdProducts: Product[];

  @OneToMany(() => Product, (product) => product.updatedBy)
  @Expose()
  @ApiProperty({ type: [Product] })
  updatedProducts: Product[];

  @OneToMany(() => Inventory, (inventory) => inventory.owner)
  @Expose()
  @ApiProperty({ type: [Inventory] })
  inventories: Inventory[];

  @OneToMany(() => Order, (order) => order.buyer)
  @Expose()
  @ApiProperty({ type: [Order] })
  orders: Order[];

  @OneToMany(() => Payout, (payout) => payout.seller)
  @Expose()
  @ApiProperty({ type: [Payout] })
  payouts: Payout[];

  @BeforeInsert()
  initializeUser() {
    this.id = uuidV4();
    const passedPassword = this.password;
    this.password = bcrypt.hashSync(passedPassword, 10);
    if (
      this.roles.some(
        (currRole) =>
          currRole.name === ADMIN_ROLE_NAME ||
          currRole.name === BUYER_ROLE_NAME,
      ) &&
      !!DEFAULT_SHIPPING_ADDRESS_VALUE
    ) {
      this.shippingAddress = DEFAULT_SHIPPING_ADDRESS_VALUE;
    }
  }
}
