import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderItem } from './entities/order-items.entity';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    UserModule,
    ProductModule,
    ClientsModule.registerAsync([
      {
        name: 'ORDER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'orders_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
