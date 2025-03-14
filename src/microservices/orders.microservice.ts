import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { OrdersMicroserviceModule } from './orders.microservices.module';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.createMicroservice(OrdersMicroserviceModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'orders_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log('Orders microservice is listening');
}
bootstrap();
