import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: Repository<Product>;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a product', async () => {
      const createProductDto = {
        name: 'Product 1',
        description: 'New Product',
        price: 100,
        stock: 10,
      };
      const createdProduct = { ...createProductDto, id: '1' };

      mockProductRepository.create.mockReturnValue(createProductDto);
      mockProductRepository.save.mockReturnValue(createdProduct);
      mockProductRepository.findOne.mockReturnValue(createdProduct);

      const result = await productService.create(createProductDto);
      expect(result.message).toBe('Product Created Successfully');
      expect(result.product).toEqual(createdProduct);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products = [{ id: '1', name: 'Product 1', price: 100, stock: 10 }];
      mockProductRepository.find.mockReturnValue(products);

      const result = await productService.findAll();
      expect(result.message).toBe('Products Fetched Successfully');
      expect(result.products).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const product = { id: '1', name: 'Product 1', price: 100, stock: 10 };
      mockProductRepository.findOne.mockReturnValue(product);

      const result = await productService.findOne('1');
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockReturnValue(null);

      await expect(productService.findOne('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      const product = { id: '1', name: 'Product 1', stock: 10 };
      mockProductRepository.findOne.mockReturnValue(product);
      mockProductRepository.save.mockReturnValue({ ...product, stock: 5 });

      await productService.updateStock('1', 5);
      expect(product.stock).toBe(5);
      expect(mockProductRepository.save).toHaveBeenCalledWith({
        ...product,
        stock: 5,
      });
    });

    it('should throw error if not enough stock', async () => {
      const product = { id: '1', name: 'Product 1', stock: 5 };
      mockProductRepository.findOne.mockReturnValue(product);

      await expect(productService.updateStock('1', 10)).rejects.toThrow(
        'Not enough stock for product Product 1',
      );
    });
  });
});
