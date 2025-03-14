import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';
import { Exclude } from 'class-transformer';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column('int')
  price: number;

  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: 'order_id' })
  @Exclude({ toPlainOnly: true }) // Exclude this property when serializing to JSON
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
