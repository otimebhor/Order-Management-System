import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { OrderItem } from './entities/order-items.entity';
import { ProductService } from '../product/product.service';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { User } from '../user/entities/user.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private userService: UserService,
    private productService: ProductService,
    private dataSource: DataSource,
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    if (!userId) {
      throw new UnauthorizedException(
        'You are unauthorized to perform this action',
      );
    }
    // Verify user exists
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create new order with proper relationship initialization
      const order = new Order();
      order.user = { id: userId } as User; // Proper relationship setup
      order.total_amount = 0;
      order.status = OrderStatus.PENDING;

      // Save order to get ID
      const savedOrder = await queryRunner.manager.save(order);

      // Process order items and calculate total
      const orderItems = await this.processOrderItems(
        queryRunner.manager,
        savedOrder,
        createOrderDto.items,
      );

      // Update order with total and items
      savedOrder.total_amount = this.calculateTotal(orderItems);
      savedOrder.orderItems = orderItems;
      await queryRunner.manager.save(savedOrder);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Send to microservice
      this.orderClient.emit('order_created', savedOrder);

      return {
        message: 'The order has been successfully created.',
        order: savedOrder,
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Process order items and update product stock
   */
  private async processOrderItems(
    entityManager: EntityManager,
    order: Order,
    itemDtos: OrderItemDto[],
  ) {
    const orderItems: OrderItem[] = [];

    for (const itemDto of itemDtos) {
      const product = await this.productService.findOne(itemDto.productId);

      if (!product) {
        throw new NotFoundException(
          `Product with ${itemDto.productId} not found`,
        );
      }

      // Check stock
      if (product.stock < itemDto.quantity) {
        throw new BadRequestException(
          `Not enough stock for product ${product.name}`,
        );
      }

      // Create order item with proper relationship initialization
      const orderItem = new OrderItem();
      orderItem.order = order;
      orderItem.product = { id: itemDto.productId } as Product; // Proper relationship setup
      orderItem.quantity = itemDto.quantity;
      orderItem.price = product.price * itemDto.quantity;

      orderItems.push(orderItem);

      // Update product stock
      product.stock -= itemDto.quantity;
      await entityManager.save(product);
    }

    // Save all order items in one operation
    return await entityManager.save(orderItems);
  }

  /**
   * Calculate total order amount from order items
   */
  private calculateTotal(orderItems: OrderItem[]) {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }
  async findAll() {
    const orders = await this.orderRepository.find({
      relations: ['orderItems', 'orderItems.product'],
    });

    return {
      message: 'All Orders fetched successfully',
      orders,
    };
  }

  async findOne(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'orderItems.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return {
      message: 'Order fetched successfully',
      order,
    };
  }
}
