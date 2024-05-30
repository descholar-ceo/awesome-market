import { Role } from '@/role/entities/role.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
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

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  @Expose()
  roles: Role[];

  @BeforeInsert()
  generateUniqId() {
    this.id = uuidV4();
    const passedPassword = this.password;
    this.password = bcrypt.hashSync(passedPassword, 10);
  }
}
