import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-items.entity';
import { User } from '../../user/entities/user.entity';
import { Transform } from 'class-transformer';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item) => {
        const { order, ...rest } = item;
        return rest;
      });
    }
    return value;
  })
  orderItems: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
