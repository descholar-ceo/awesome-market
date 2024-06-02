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
export class Category {
  @PrimaryColumn()
  @Expose()
  id: string;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  createdAt: Date;

  @Column()
  @Expose()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdCategories)
  @JoinColumn({ name: 'created_by' })
  @Expose()
  createdBy: User;

  @ManyToOne(() => User, (user) => user.updatedCategories)
  @JoinColumn({ name: 'updated_by' })
  @Expose()
  updatedBy: User;

  @OneToMany(() => Product, (product) => product.category)
  @Expose()
  products: Product[];

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
  }
}
