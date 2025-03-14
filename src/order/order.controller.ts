import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  NotFoundException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetCurrentUser } from '../auth/get-current-user-id.decorator-id';

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiNotFoundResponse({ description: 'User Not Found' })
  @ApiCreatedResponse({
    description: 'The order has been created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'You are unauthorized to perform this action',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @GetCurrentUser('userId') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    try {
      return this.orderService.create(userId, createOrderDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof UnauthorizedException) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiOkResponse({ description: 'All Orders fetched successfully' })
  async findAll() {
    try {
      return this.orderService.findAll();
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

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiOkResponse({ description: 'Order fetched successfully' })
  @ApiNotFoundResponse({ description: 'Order with ID  not found' })
  async findOne(@Param('id') id: string) {
    try {
      return this.orderService.findOne(id);
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
