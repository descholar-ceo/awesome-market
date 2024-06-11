import { Product } from '@/product/entities/product.entity';
import { User } from '@/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  id: string;

  @Column()
  @Expose()
  @ApiProperty()
  rating: number;

  @Column()
  @Expose()
  @ApiProperty()
  comment: string;

  @Column()
  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Column()
  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'rated_by' })
  @Expose()
  @ApiProperty({ type: User })
  ratedBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  @Expose()
  @ApiProperty({ type: User })
  updatedBy: User;

  @ManyToOne(() => Product, (product) => product.reviews)
  @Expose()
  @ApiProperty({ type: () => Product })
  product: Product;

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
  }
}
