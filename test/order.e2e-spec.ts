import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { OrderController } from '../src/order/order.controller'
import * as request from 'supertest';
import { OrderService } from '../src/order/order.service';
import { UserService } from '../src/user/user.service';
import { ProductService } from '../src/product/product.service';

describe('OrderController (Integration)', () => {
  let app: INestApplication;
  let orderController: OrderController;
  let orderService: OrderService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [OrderService, UserService, ProductService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    orderController = moduleFixture.get<OrderController>(OrderController);
    orderService = moduleFixture.get<OrderService>(OrderService);
  });

  it('should create an order and return success response', async () => {
    const createOrderDto = { items: [] };

    jest.spyOn(orderService, 'create').mockResolvedValue({
      message: 'The order has been successfully created.',
      order: {},
    });

    const response = await request(app.getHttpServer()) // Use Supertest
      .post('/orders')
      .set('Authorization', 'Bearer valid_token')
      .send(createOrderDto)
      .expect(201); // HTTP status code 201

    expect(response.body.message).toBe(
      'The order has been successfully created.',
    );
    expect(response.body.order).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
