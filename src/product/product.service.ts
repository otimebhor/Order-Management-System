import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const productData = this.productRepository.create(createProductDto);
    const newProduct = await this.productRepository.save(productData);
    const product = await this.productRepository.findOne({
      where: { id: newProduct.id },
    });

    return {
      message: 'Product Created Successfully',
      product,
    };
  }

  async findAll() {
    const products = await this.productRepository.find();
    return {
      message: 'Products Fetched Successfully',
      products,
    };
  }

  async findOne(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return product;
  }

  async updateStock(productId: string, quantity: number) {
    const product = await this.findOne(productId);
    if (product.stock < quantity) {
      throw new Error(`Not enough stock for product ${product.name}`);
    }

    product.stock -= quantity;
    await this.productRepository.save(product);
  }
}
