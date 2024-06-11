import { Category } from '@/category/entities/category.entity';
import { prepareUniqueCode } from '@/common/utils/strings.utils';
import { Inventory } from '@/inventory/entities/inventory.entity';
import { Review } from '@/review/entities/review.entity';
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
export class Product {
  @PrimaryColumn()
  @Expose()
  @ApiProperty()
  id: string;

  @Column({ unique: true })
  @Expose()
  @ApiProperty()
  code: string;

  @Column()
  @Expose()
  @ApiProperty()
  name: string;

  @Column()
  @Expose()
  @ApiProperty()
  description: string;

  @ManyToOne(() => Category, (category) => category.products)
  @Expose()
  @ApiProperty({ type: () => Category })
  category: Category;

  @Column()
  @Expose()
  @ApiProperty()
  unitPrice: number;

  @Column()
  @Expose()
  @ApiProperty()
  thumbnail: string;

  @Column()
  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Column()
  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdProducts)
  @JoinColumn({ name: 'created_by' })
  @Expose()
  @ApiProperty({ type: User })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.updatedProducts)
  @JoinColumn({ name: 'updated_by' })
  @Expose()
  @ApiProperty({ type: User })
  updatedBy: User;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  @Expose()
  @ApiProperty({ type: [Inventory] })
  inventories: Inventory[];

  @OneToMany(() => Review, (review) => review.product)
  @Expose()
  @ApiProperty({ type: [Review] })
  reviews: Review[];

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
    this.code = prepareUniqueCode(this.name, { name: this.category.name });
  }
}
