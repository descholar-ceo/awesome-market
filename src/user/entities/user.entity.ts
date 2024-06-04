import { Category } from '@/category/entities/category.entity';
import { Inventory } from '@/inventory/entities/inventory.entity';
import { Order } from '@/order/entities/order.entity';
import { Product } from '@/product/entities/product.entity';
import { Role } from '@/role/entities/role.entity';
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

  @BeforeInsert()
  generateUniqId() {
    this.id = uuidV4();
    const passedPassword = this.password;
    this.password = bcrypt.hashSync(passedPassword, 10);
  }
}
