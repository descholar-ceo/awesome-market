import { Category } from '@/category/entities/category.entity';
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
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

@Entity()
export class Product {
  @PrimaryColumn()
  @Expose()
  id: string;

  @Column({ unique: true })
  @Expose()
  code: string;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  description: string;

  @ManyToOne(() => Category, (category) => category.products)
  @Expose()
  category: Category;

  @Column()
  @Expose()
  unitPrice: number;

  @Column()
  @Expose()
  thumbnail: string;

  @Column()
  @Expose()
  createdAt: Date;

  @Column()
  @Expose()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdProducts)
  @JoinColumn({ name: 'created_by' })
  @Expose()
  createdBy: User;

  @ManyToOne(() => User, (user) => user.updatedProducts)
  @JoinColumn({ name: 'updated_by' })
  @Expose()
  updatedBy: User;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventories: Inventory[];

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
    this.code = prepareUniqueCode(this.name, { name: this.category.name });
  }
}
