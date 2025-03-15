import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('ProductController', () => {
  let app: INestApplication;
  let productService: ProductService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            updateStock: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    productService = moduleRef.get<ProductService>(ProductService);
  });

  it('/products (POST) should create a product', async () => {
    const createProductDto: CreateProductDto = {
      name: 'Product 1',
      description: 'New product',
      price: 100,
      stock: 10,
    };
    const createdProduct = {
      id: '1',
      created_at: new Date(Date.now()),
      updated_at: new Date(Date.now()),
      name: 'Product 1',
      description: 'Product description',
      price: 100,
      stock: 10,
    };

    jest.spyOn(productService, 'create').mockResolvedValue({
      message: 'Product Created Successfully',
      product: createdProduct,
    });

    return request(app.getHttpServer())
      .post('/products')
      .send(createProductDto)
      .expect(HttpStatus.CREATED)
      .expect({
        message: 'Product Created Successfully',
        product: createdProduct,
      });
  });

  it('/products (GET) should return all products', async () => {
    const products = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Test',
        price: 100,
        stock: 10,
        created_at: new Date(Date.now()),
        updated_at: new Date(Date.now()),
      },
    ];
    jest.spyOn(productService, 'findAll').mockResolvedValue({
      message: 'Products Fetched Successfully',
      products,
    });

    return request(app.getHttpServer())
      .get('/products')
      .expect(HttpStatus.OK)
      .expect({ message: 'Products Fetched Successfully', products });
  });

  it('/products/:id (GET) should return product by ID', async () => {
    const product = {
      id: '1',
      name: 'Product 1',
      description: 'Product description',
      price: 100,
      stock: 10,
      created_at: new Date(Date.now()),
      updated_at: new Date(Date.now()),
    };

    jest.spyOn(productService, 'findOne').mockResolvedValue(product);

    return request(app.getHttpServer())
      .get('/products/1')
      .expect(HttpStatus.OK)
      .expect(product);
  });

  it('/products/:id (GET) should throw NotFoundException', async () => {
    jest
      .spyOn(productService, 'findOne')
      .mockRejectedValue(new NotFoundException('Product not found'));

    return request(app.getHttpServer())
      .get('/products/1')
      .expect(HttpStatus.NOT_FOUND)
      .expect({
        statusCode: 404,
        message: 'Product not found',
        error: 'Not Found',
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
