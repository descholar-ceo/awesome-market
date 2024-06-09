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

@Entity()
export class User {
  @PrimaryColumn()
  @Expose()
  id: string;

  @Column({ unique: true })
  @Expose()
  email: string;

  @Column({ unique: true })
  @Expose()
  phoneNumber: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  @Expose()
  firstName: string;

  @Column()
  @Expose()
  lastName: string;

  @Column({ default: true })
  @Expose()
  isActive: boolean;

  @Column()
  @Expose()
  createdAt: Date;

  @Column()
  @Expose()
  updatedAt: Date;

  @Column({ nullable: true })
  @Expose()
  shippingAddress?: string;

  @Column()
  @Expose()
  stripeAccountId?: string;

  @Column({ default: 'rwf' })
  @Expose()
  currency: string;

  // RELATIONS
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  @Expose()
  roles: Role[];

  @OneToMany(() => Category, (category) => category.createdBy)
  @Expose()
  createdCategories: Category[];

  @OneToMany(() => Category, (category) => category.updatedBy)
  @Expose()
  updatedCategories: Category[];

  @OneToMany(() => Product, (product) => product.createdBy)
  @Expose()
  createdProducts: Product[];

  @OneToMany(() => Product, (product) => product.updatedBy)
  @Expose()
  updatedProducts: Product[];

  @OneToMany(() => Inventory, (inventory) => inventory.owner)
  @Expose()
  inventories: Inventory[];

  @OneToMany(() => Order, (order) => order.buyer)
  @Expose()
  orders: Order[];

  @OneToMany(() => Payout, (payout) => payout.seller)
  @Expose()
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
