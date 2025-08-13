import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user without profile fields and exclude password', async () => {
      const registerDto: RegisterDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      mockAuthService.register.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashedpassword',
        firstName: undefined,
        lastName: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(
        'test@test.com',
        'password123',
        undefined,
        undefined,
      );
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@test.com');
    });

    it('should register user with profile fields and exclude password', async () => {
      const registerDto: RegisterDto = {
        email: 'jane@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      mockAuthService.register.mockResolvedValue({
        id: 2,
        email: 'jane@test.com',
        password: 'hashedpassword',
        firstName: 'Jane',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(
        'jane@test.com',
        'password123',
        'Jane',
        'Doe',
      );
      expect(result).not.toHaveProperty('password');
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Doe');
    });
  });

  describe('login', () => {
    it('should call AuthService.login with DTO and return JWT', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue({ access_token: 'jwt-token' });

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(result).toEqual({ access_token: 'jwt-token' });
    });
  });
});
