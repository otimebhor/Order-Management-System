import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiOkResponse({ description: 'User Logged in successfully' })
  @ApiBadRequestResponse({ description: 'Invalid email or password' })
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    try {
      return this.authService.login(loginDto);
    } catch (error) {
      console.log(error);
      this.logger.error(error.message);
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
}
