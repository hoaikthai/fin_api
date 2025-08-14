import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { compare, hash } from 'bcryptjs';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

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
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    jwtService = { signAsync: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw if user already exists', async () => {
      userService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
      });
      await expect(service.register('test@test.com', 'pass')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create user without profile fields if not exists', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
      });
      (hash as jest.Mock).mockResolvedValue('hashed');
      const user = await service.register('test@test.com', 'pass');
      expect(userService.create).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'hashed',
        firstName: undefined,
        lastName: undefined,
      });
      expect(user).toEqual({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
      });
    });

    it('should create user with profile fields', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
      });
      (hash as jest.Mock).mockResolvedValue('hashed');
      const user = await service.register(
        'test@test.com',
        'pass',
        'John',
        'Doe',
      );
      expect(userService.create).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(user).toEqual({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
      });
    });
  });

  describe('validateUser', () => {
    it('should throw if user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);
      await expect(
        service.validateUser('test@test.com', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('should throw if password invalid', async () => {
      userService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
      });
      (compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.validateUser('test@test.com', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('should return user if password valid', async () => {
      userService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
      });
      (compare as jest.Mock).mockResolvedValue(true);
      const user = await service.validateUser('test@test.com', 'pass');
      expect(user).toEqual({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
      });
    });
  });

  describe('login', () => {
    it('should return access_token if credentials valid', async () => {
      userService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
      });
      (compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login('test@test.com', 'pass');
      expect(userService.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(compare).toHaveBeenCalledWith('pass', 'hashed');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@test.com',
      });
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw if credentials invalid', async () => {
      userService.findByEmail.mockResolvedValue(null);
      await expect(service.login('bad@test.com', 'badpass')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
