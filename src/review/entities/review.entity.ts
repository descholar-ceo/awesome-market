import { Product } from '@/product/entities/product.entity';
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

@Entity()
export class Review {
  @PrimaryColumn()
  @Expose()
  id: string;

  @Column()
  @Expose()
  rating: number;

  @Column()
  @Expose()
  comment: string;

  @Column()
  @Expose()
  createdAt: Date;

  @Column()
  @Expose()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'rated_by' })
  @Expose()
  ratedBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  @Expose()
  updatedBy: User;

  @ManyToOne(() => Product, (product) => product.reviews)
  @Expose()
  product: Product;

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
  }
}
