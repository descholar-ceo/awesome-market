import { User } from '@/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToMany,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

@Entity()
export class Role {
  @PrimaryColumn()
  @Expose()
  @ApiProperty()
  id: string;

  @Column({ unique: true })
  @Expose()
  @ApiProperty()
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  @Expose()
  @ApiProperty()
  users: User[];

  @Column()
  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Column()
  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
  }
}
