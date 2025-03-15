import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-items.entity';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import {
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { User } from '../user/entities/user.entity';
import { Product } from '../product/entities/product.entity';

// Mock implementations
const mockOrderRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

const mockOrderItemRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
});

const mockUserService = () => ({
  findOne: jest.fn(),
});

const mockProductService = () => ({
  findOne: jest.fn(),
});

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    save: jest.fn(),
  },
};

const mockDataSource = () => ({
  createQueryRunner: jest.fn(() => mockQueryRunner),
});

const mockOrderClient = () => ({
  emit: jest.fn(),
});

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: Repository<Order>;
  let orderItemRepository: Repository<OrderItem>;
  let userService: UserService;
  let productService: ProductService;
  let dataSource: DataSource;
  let orderClient: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useFactory: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useFactory: mockOrderItemRepository,
        },
        {
          provide: UserService,
          useFactory: mockUserService,
        },
        {
          provide: ProductService,
          useFactory: mockProductService,
        },
        {
          provide: DataSource,
          useFactory: mockDataSource,
        },
        {
          provide: 'ORDER_SERVICE',
          useFactory: mockOrderClient,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderItemRepository = module.get<Repository<OrderItem>>(
      getRepositoryToken(OrderItem),
    );
    userService = module.get<UserService>(UserService);
    productService = module.get<ProductService>(ProductService);
    dataSource = module.get<DataSource>(DataSource);
    orderClient = module.get<ClientProxy>('ORDER_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userId = 'user-id-123';
    const createOrderDto: CreateOrderDto = {
      items: [
        { productId: 'product-id-123', quantity: 2 },
        { productId: 'product-id-456', quantity: 1 },
      ],
    };

    const mockUser = { id: userId } as User;
    const mockProduct1 = {
      id: 'product-id-123',
      name: 'Test Product 1',
      price: 100,
      stock: 5,
    } as Product;
    const mockProduct2 = {
      id: 'product-id-456',
      name: 'Test Product 2',
      price: 50,
      stock: 10,
    } as Product;

    const mockOrder = {
      id: 'order-id-123',
      user: { id: userId },
      total_amount: 0,
      status: OrderStatus.PENDING,
    } as Order;

    const mockOrderItems = [
      {
        order: mockOrder,
        product: { id: 'product-id-123' },
        quantity: 2,
        price: 200,
      } as OrderItem,
      {
        order: mockOrder,
        product: { id: 'product-id-456' },
        quantity: 1,
        price: 50,
      } as OrderItem,
    ];

    it('should create an order successfully', async () => {
      // Arrange
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(productService, 'findOne')
        .mockResolvedValueOnce({ ...mockProduct1 })
        .mockResolvedValueOnce({ ...mockProduct2 });

      mockQueryRunner.manager.save
        .mockResolvedValueOnce({ ...mockOrder }) // For initial order save
        .mockResolvedValueOnce(mockOrderItems) // For saving order items
        .mockResolvedValueOnce({
          ...mockOrder,
          total_amount: 250,
          orderItems: mockOrderItems,
        }); // For final order save

      // Act
      const result = await service.create(userId, createOrderDto);

      // Assert
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(3);
      expect(productService.findOne).toHaveBeenCalledTimes(2);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(orderClient.emit).toHaveBeenCalledWith(
        'order_created',
        expect.any(Object),
      );
      expect(result).toEqual({
        message: 'The order has been successfully created.',
        order: expect.any(Object),
      });
    });

    it('should throw UnauthorizedException if userId is not provided', async () => {
      // Act & Assert
      await expect(service.create('', createOrderDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Arrange
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(userId, createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if product is not found', async () => {
      // Arrange
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(productService, 'findOne').mockResolvedValue(null);
      mockQueryRunner.manager.save.mockResolvedValueOnce({ ...mockOrder });

      // Act & Assert
      await expect(service.create(userId, createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if product stock is insufficient', async () => {
      // Arrange
      const lowStockProduct = { ...mockProduct1, stock: 1 };
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(productService, 'findOne').mockResolvedValue(lowStockProduct);
      mockQueryRunner.manager.save.mockResolvedValueOnce({ ...mockOrder });

      // Act & Assert
      await expect(service.create(userId, createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should roll back transaction on error', async () => {
      // Arrange
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(productService, 'findOne').mockImplementation(() => {
        throw new Error('Database error');
      });
      mockQueryRunner.manager.save.mockResolvedValueOnce({ ...mockOrder });

      // Act & Assert
      await expect(service.create(userId, createOrderDto)).rejects.toThrow(
        'Database error',
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      // Arrange
      const mockOrders = [
        { id: '1', status: OrderStatus.PENDING },
        { id: '2', status: OrderStatus.DELIVERED },
      ];
      jest
        .spyOn(orderRepository, 'find')
        .mockResolvedValue(mockOrders as Order[]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(orderRepository.find).toHaveBeenCalledWith({
        relations: ['orderItems', 'orderItems.product'],
      });
      expect(result).toEqual({
        message: 'All Orders fetched successfully',
        orders: mockOrders,
      });
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      // Arrange
      const orderId = 'order-id-123';
      const mockOrder = { id: orderId, status: OrderStatus.PENDING };
      jest
        .spyOn(orderRepository, 'findOne')
        .mockResolvedValue(mockOrder as Order);

      // Act
      const result = await service.findOne(orderId);

      // Assert
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: orderId },
        relations: ['orderItems', 'orderItems.product'],
      });
      expect(result).toEqual({
        message: 'Order fetched successfully',
        order: mockOrder,
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      // Arrange
      const orderId = 'non-existent-id';
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(orderId)).rejects.toThrow(NotFoundException);
    });
  });
});
