import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../src/auth/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { User } from '../src/user/entities/user.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
  };

  const mockToken = 'jwt-token';

  const mockAuthService = {
    login: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should return 200 and user data with token when credentials are valid', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const expectedResponse = {
        ...mockUser,
        password: undefined,
        token: mockToken,
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(expectedResponse);
          expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });

    it('should return 400 when email or password is invalid', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const errorMessage = 'Invalid email or password';

      mockAuthService.login.mockRejectedValue(
        new BadRequestException(errorMessage),
      );

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(errorMessage);
          expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });

    it('should return 400 when email is missing', async () => {
      const loginDto = { password: 'password123' };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email');
          expect(authService.login).not.toHaveBeenCalled();
        });
    });

    it('should return 400 when password is missing', async () => {
      const loginDto = { email: 'test@example.com' };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('password');
          expect(authService.login).not.toHaveBeenCalled();
        });
    });

    it('should return 500 when an unexpected error occurs', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const errorMessage = 'Internal server error';

      mockAuthService.login.mockRejectedValue(new Error(errorMessage));

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(500)
        .expect((res) => {
          expect(res.body.message).toBe(errorMessage);
          expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });
  });
});
