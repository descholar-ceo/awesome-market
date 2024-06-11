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
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

@Entity()
export class Category {
  @PrimaryColumn()
  @Expose()
  @ApiProperty()
  id: string;

  @Column()
  @Expose()
  @ApiProperty()
  name: string;

  @Column()
  @Expose()
  @ApiProperty()
  description: string;

  @Column()
  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Column()
  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdCategories)
  @JoinColumn({ name: 'created_by' })
  @Expose()
  @ApiProperty({ type: User })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.updatedCategories)
  @JoinColumn({ name: 'updated_by' })
  @Expose()
  @ApiProperty({ type: User })
  updatedBy: User;

  @OneToMany(() => Product, (product) => product.category)
  @Expose()
  @ApiProperty({ type: [Product] })
  products: Product[];

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
  }
}
