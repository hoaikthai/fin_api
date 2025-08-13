import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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

  it('should call AuthService.register on register', async () => {
    mockAuthService.register.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      password: 'hashed',
    });
    const result = await controller.register('a@b.com', 'pass');
    expect(authService.register).toHaveBeenCalledWith('a@b.com', 'pass');
    expect(result).toEqual({ id: 1, email: 'a@b.com', password: 'hashed' });
  });

  it('should call AuthService.login on login and return JWT', async () => {
    mockAuthService.login.mockResolvedValue({ access_token: 'jwt-token' });
    const result = await controller.login('a@b.com', 'pass');
    expect(authService.login).toHaveBeenCalledWith('a@b.com', 'pass');
    expect(result).toEqual({ access_token: 'jwt-token' });
  });
});
