import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  HttpException,
  ConflictException,
  NotFoundException,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiConflictResponse({ description: 'Email already exists' })
  @ApiCreatedResponse({ description: 'User Created Successfully' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return this.userService.create(createUserDto);
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiNotFoundResponse({ description: `User with ID  not found` })
  async findOne(@Param('id') id: string) {
    try {
      return this.userService.findOne(id);
    } catch (error) {
      this.logger.error(error.message);
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

  @Get(':id/orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders of a user' })
  @ApiResponse({ status: 200, description: 'Return the user with orders.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findUserOrders(@Param('id') id: string): Promise<User> {
    return this.userService.findUserOrders(id);
  }
}
