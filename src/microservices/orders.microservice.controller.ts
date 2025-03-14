import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import type { OrdersMicroserviceService } from './orders.microservice.service';
import { Order } from '../order/entities/order.entity';

@Controller()
export class OrdersMicroserviceController {
  constructor(private readonly ordersService: OrdersMicroserviceService) {}

  @EventPattern('order_created')
  async handleOrderCreated(order: Order) {
    this.ordersService.processOrder(order);
  }
}
