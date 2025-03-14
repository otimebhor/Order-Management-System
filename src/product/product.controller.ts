import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  HttpException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiCreatedResponse({
    description: 'The product has been successfully created.',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      return this.productService.create(createProductDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiOkResponse({ description: 'Products Fetched Successfully' })
  @HttpCode(HttpStatus.OK)
  async findAll() {
    try {
      return this.productService.findAll();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiNotFoundResponse({ description: 'Product with ID not found' })
  @ApiOkResponse({ description: 'Product Fetched Successfully' })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    try {
      return this.productService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
