import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

@Entity()
export class Product {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @BeforeInsert()
  generateUniqIds() {
    this.id = uuidV4();
  }
}
