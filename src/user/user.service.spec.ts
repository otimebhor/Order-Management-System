import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({} as User);

      try {
        await service.create({
          email: 'test@test.com',
          password: 'password',
          name: 'Test User',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('should create a user successfully', async () => {
      const createUserDto = {
        email: 'test@test.com',
        name: 'Test user',
        password: 'password',
      };
      const hashedPassword = 'hashedpassword';
      const user = {
        id: '1',
        email: 'test@test.com',
        password: hashedPassword,
      };

      // Mocking the repository methods
      mockUserRepository.findOne.mockResolvedValue(null); // Email not found
      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.save.mockResolvedValue(user); // Ensure save returns the correct user
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      const result = await service.create(createUserDto);

      // Checking if the correct result is returned
      expect(result.message).toBe('User Created Successfully');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      try {
        await service.findOne('nonexistent-id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return user when user is found', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        password: 'hashedpassword',
      };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');
      expect(result).toEqual(user);
    });
  });

  describe('findByEmail', () => {
    it('should throw NotFoundException if user is not found by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      try {
        await service.findByEmail('nonexistent-email@test.com');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return user when found by email', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        password: 'hashedpassword',
      };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('test@test.com');
      expect(result).toEqual(user);
    });
  });

  describe('findUserOrders', () => {
    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      try {
        await service.findUserOrders('nonexistent-id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return user with orders', async () => {
      const user = { id: '1', email: 'test@test.com', orders: [] };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findUserOrders('1');
      expect(result).toEqual(user);
    });
  });
});
