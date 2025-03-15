import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };
    const loginResponse = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      token: 'jwt-token',
    };

    it('should return login response when credentials are valid', async () => {
      mockAuthService.login.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(loginResponse);
    });

    it('should handle BadRequestException from service', async () => {
      const errorMessage = 'Invalid email or password';
      mockAuthService.login.mockRejectedValue(
        new BadRequestException(errorMessage),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle other exceptions from service', async () => {
      const errorMessage = 'Something went wrong';
      mockAuthService.login.mockRejectedValue(new Error(errorMessage));

      await expect(controller.login(loginDto)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
