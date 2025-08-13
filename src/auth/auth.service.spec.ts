import { Test, TestingModule } from '@nestjs/testing';
import { hash, compare } from 'bcryptjs';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockUserService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: typeof mockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw if user already exists', async () => {
      userService.findByEmail.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashed' });
      await expect(service.register('test@test.com', 'pass')).rejects.toThrow(ConflictException);
    });
    it('should create user if not exists', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashed' });
      (hash as jest.Mock).mockResolvedValue('hashed');
      const user = await service.register('test@test.com', 'pass');
      expect(userService.create).toHaveBeenCalledWith({ email: 'test@test.com', password: 'hashed' });
      expect(user).toEqual({ id: 1, email: 'test@test.com', password: 'hashed' });
    });
  });

  describe('validateUser', () => {
    it('should throw if user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);
      await expect(service.validateUser('test@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });
    it('should throw if password invalid', async () => {
      userService.findByEmail.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashed' });
      (compare as jest.Mock).mockResolvedValue(false);
      await expect(service.validateUser('test@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });
    it('should return user if password valid', async () => {
      userService.findByEmail.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashed' });
      (compare as jest.Mock).mockResolvedValue(true);
      const user = await service.validateUser('test@test.com', 'pass');
      expect(user).toEqual({ id: 1, email: 'test@test.com', password: 'hashed' });
    });
  });
});
