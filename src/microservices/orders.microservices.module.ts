import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersMicroserviceController } from './orders.microservice.controller';
import { OrdersMicroserviceService } from './orders.microservice.service';
import { OrderItem } from '../order/entities/order-items.entity';
import { Order } from '../order/entities/order.entity';
import * as dotenv from 'dotenv';

dotenv.config();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number.parseInt(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [Order, OrderItem],
        synchronize: process.env.NODE_ENV !== 'production',
      }),
    }),
    TypeOrmModule.forFeature([Order, OrderItem]),
  ],
  controllers: [OrdersMicroserviceController],
  providers: [OrdersMicroserviceService],
})
export class OrdersMicroserviceModule {}
