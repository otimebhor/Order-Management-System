import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../order/entities/order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the user' })
  id: string;

  @Column()
  @ApiProperty({ description: 'The name of the user' })
  name: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @CreateDateColumn()
  @ApiProperty({ description: 'The date when the user was created' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The date when the user was last updated' })
  updated_at: Date;
}
