import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Order, OrderStatus } from '../order/entities/order.entity';

@Injectable()
export class OrdersMicroserviceService {
  private readonly logger = new Logger(OrdersMicroserviceService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async processOrder(order: Order): Promise<void> {
    this.logger.log(`Processing order ${order.id}`);

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update order status
    await this.orderRepository.update(order.id, {
      status: OrderStatus.PROCESSING,
    });
    this.logger.log(
      `Order ${order.id} status updated to ${OrderStatus.PROCESSING}`,
    );

    // Simulate shipping process
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Update order status to shipped
    await this.orderRepository.update(order.id, {
      status: OrderStatus.SHIPPED,
    });
    this.logger.log(
      `Order ${order.id} status updated to ${OrderStatus.SHIPPED}`,
    );
  }
}
