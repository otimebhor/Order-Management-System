import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) {
      this.logger.log('Invalid email or password');
      throw new BadRequestException('Invalid email or password');
    }

    const isPasswordValid = await this.comparePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      this.logger.error('Invalid email or password');
      throw new BadRequestException('Invalid email or password');
    }

    const token = await this.getToken(user.id, user.email);

    return {
      ...user,
      password: undefined,

      token,
    };
  }

  private async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isPasswordMatching = bcrypt.compare(password, hashedPassword);
    return isPasswordMatching;
  }

  async getToken(userId: string, email: string) {
    const token = await this.jwtService.signAsync({
      sub: userId,
      email,
    });
    return token;
  }
}
