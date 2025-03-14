import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the product' })
  id: string;

  @Column()
  @ApiProperty({ description: 'The name of the product' })
  name: string;

  @Column('text')
  @ApiProperty({ description: 'The description of the product' })
  description: string;

  @Column('int')
  @ApiProperty({ description: 'The price of the product' })
  price: number;

  @Column('int')
  @ApiProperty({ description: 'The stock quantity of the product' })
  stock: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'The date when the product was created' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The date when the product was last updated' })
  updated_at: Date;
}
