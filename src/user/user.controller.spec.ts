import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as request from 'supertest';

describe('UserController', () => {
  let app;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findUserOrders: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Mock the JwtAuthGuard
      .useValue({
        canActivate: jest.fn(() => true), // Mock the behavior as if the guard is passed
      })
      .compile();

    app = module.createNestApplication();
    await app.init();
    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@test.com',
        password: 'password',
        name: 'Test',
      };
      mockUserService.create.mockResolvedValue({
        message: 'User Created Successfully',
        userDetails: { id: '1', email: 'test@test.com' },
      });

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect({
          message: 'User Created Successfully',
          userDetails: { id: '1', email: 'test@test.com' },
        });
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@test.com',
        password: 'password',
      };
      mockUserService.create.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(409)
        .expect({ statusCode: 409, message: 'Email already exists' });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      mockUserService.findOne.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
      });

      return request(app.getHttpServer())
        .get('/users/1')
        .expect(200)
        .expect({ id: '1', email: 'test@test.com' });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserService.findOne.mockRejectedValue(
        new NotFoundException('User with ID 1 not found'),
      );

      return request(app.getHttpServer())
        .get('/users/1')
        .expect(404)
        .expect({ statusCode: 404, message: 'User with ID 1 not found' });
    });
  });

  describe('GET /users/:id/orders', () => {
    it('should return user orders', async () => {
      mockUserService.findUserOrders.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        orders: [],
      });

      return request(app.getHttpServer())
        .get('/users/1/orders')
        .expect(200)
        .expect({
          id: '1',
          email: 'test@test.com',
          orders: [],
        });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserService.findUserOrders.mockRejectedValue(
        new NotFoundException('User with ID 1 not found'),
      );

      return request(app.getHttpServer())
        .get('/users/1/orders')
        .expect(404)
        .expect({ statusCode: 404, message: 'User with ID 1 not found' });
    });
  });
});
