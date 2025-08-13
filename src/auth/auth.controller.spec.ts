import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  validateUser: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('should call AuthService.register on register', async () => {
    mockAuthService.register.mockResolvedValue({ id: 1, email: 'a@b.com', password: 'hashed' });
    const result = await controller.register('a@b.com', 'pass');
    expect(authService.register).toHaveBeenCalledWith('a@b.com', 'pass');
    expect(result).toEqual({ id: 1, email: 'a@b.com', password: 'hashed' });
  });

  it('should call AuthService.validateUser on login', async () => {
    mockAuthService.validateUser.mockResolvedValue({ id: 1, email: 'a@b.com', password: 'hashed' });
    const result = await controller.login('a@b.com', 'pass');
    expect(authService.validateUser).toHaveBeenCalledWith('a@b.com', 'pass');
    expect(result).toEqual({ id: 1, email: 'a@b.com', password: 'hashed' });
  });
});
