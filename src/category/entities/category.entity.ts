import { User } from '@/user/entities/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

@Entity()
export class Category {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdCategories)
  createdBy: User;

  @ManyToOne(() => User, (user) => user.updatedCategories)
  updatedBy: User;

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
  }
}
