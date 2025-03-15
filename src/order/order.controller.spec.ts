import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockOrder = {
    id: 'order-id',
    user: { id: 'user-id' },
    total_amount: 100,
    status: 'PENDING',
    orderItems: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const userId = 'user-id';
    const createOrderDto: CreateOrderDto = {
      items: [
        {
          productId: 'product-id',
          quantity: 2,
        },
      ],
    };

    it('should create an order successfully', async () => {
      mockOrderService.create.mockResolvedValue({
        message: 'The order has been successfully created.',
        order: mockOrder,
      });

      const result = await controller.create(userId, createOrderDto);

      expect(service.create).toHaveBeenCalledWith(userId, createOrderDto);
      expect(result).toEqual({
        message: 'The order has been successfully created.',
        order: mockOrder,
      });
    });

    it('should throw HttpException with NOT_FOUND status when NotFoundException is thrown', async () => {
      mockOrderService.create.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.create(userId, createOrderDto)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException with UNAUTHORIZED status when UnauthorizedException is thrown', async () => {
      mockOrderService.create.mockRejectedValue(
        new UnauthorizedException(
          'You are unauthorized to perform this action',
        ),
      );

      await expect(controller.create(userId, createOrderDto)).rejects.toThrow(
        new HttpException(
          'You are unauthorized to perform this action',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it('should throw HttpException with INTERNAL_SERVER_ERROR status for other errors', async () => {
      mockOrderService.create.mockRejectedValue(new Error('Internal error'));

      await expect(controller.create(userId, createOrderDto)).rejects.toThrow(
        new HttpException('Internal error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      mockOrderService.findAll.mockResolvedValue({
        message: 'All Orders fetched successfully',
        orders: [mockOrder],
      });

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'All Orders fetched successfully',
        orders: [mockOrder],
      });
    });

    it('should throw HttpException with NOT_FOUND status when NotFoundException is thrown', async () => {
      mockOrderService.findAll.mockRejectedValue(
        new NotFoundException('Orders not found'),
      );

      await expect(controller.findAll()).rejects.toThrow(
        new HttpException('Orders not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException with INTERNAL_SERVER_ERROR status for other errors', async () => {
      mockOrderService.findAll.mockRejectedValue(new Error('Internal error'));

      await expect(controller.findAll()).rejects.toThrow(
        new HttpException('Internal error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('findOne', () => {
    const orderId = 'order-id';

    it('should return the order if found', async () => {
      mockOrderService.findOne.mockResolvedValue({
        message: 'Order fetched successfully',
        order: mockOrder,
      });

      const result = await controller.findOne(orderId);

      expect(service.findOne).toHaveBeenCalledWith(orderId);
      expect(result).toEqual({
        message: 'Order fetched successfully',
        order: mockOrder,
      });
    });

    it('should throw HttpException with NOT_FOUND status when NotFoundException is thrown', async () => {
      mockOrderService.findOne.mockRejectedValue(
        new NotFoundException(`Order with ID ${orderId} not found`),
      );

      await expect(controller.findOne(orderId)).rejects.toThrow(
        new HttpException(
          `Order with ID ${orderId} not found`,
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw HttpException with INTERNAL_SERVER_ERROR status for other errors', async () => {
      mockOrderService.findOne.mockRejectedValue(new Error('Internal error'));

      await expect(controller.findOne(orderId)).rejects.toThrow(
        new HttpException('Internal error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });
});
