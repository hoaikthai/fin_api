import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthenticatedRequest } from '../common/types';

const mockAccountService = {
  create: jest.fn(),
  findAllByUser: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('AccountController', () => {
  let controller: AccountController;
  let accountService: typeof mockAccountService;

  const mockAuthenticatedRequest = {
    user: {
      sub: 1,
      email: 'test@example.com',
    },
  } as AuthenticatedRequest;

  const mockAccount = {
    id: 1,
    name: 'Test Account',
    currency: 'USD',
    balance: 1000,
    description: 'Test description',
    isActive: true,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [{ provide: AccountService, useValue: mockAccountService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AccountController>(AccountController);
    accountService = module.get(AccountService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new account', async () => {
      const createAccountDto: CreateAccountDto = {
        name: 'New Account',
        currency: 'USD',
        balance: 500,
        description: 'New account',
      };

      mockAccountService.create.mockResolvedValue(mockAccount);

      const result = await controller.create(
        mockAuthenticatedRequest,
        createAccountDto,
      );

      expect(accountService.create).toHaveBeenCalledWith(1, createAccountDto);
      expect(result).toEqual(mockAccount);
    });

    it('should create account without optional fields', async () => {
      const createAccountDto: CreateAccountDto = {
        name: 'New Account',
        currency: 'USD',
      };

      mockAccountService.create.mockResolvedValue(mockAccount);

      const result = await controller.create(
        mockAuthenticatedRequest,
        createAccountDto,
      );

      expect(accountService.create).toHaveBeenCalledWith(1, createAccountDto);
      expect(result).toEqual(mockAccount);
    });
  });

  describe('findAll', () => {
    it('should return all accounts for the authenticated user', async () => {
      const mockAccounts = [
        mockAccount,
        { ...mockAccount, id: 2, name: 'Account 2' },
      ];
      mockAccountService.findAllByUser.mockResolvedValue(mockAccounts);

      const result = await controller.findAll(mockAuthenticatedRequest);

      expect(accountService.findAllByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockAccounts);
    });

    it('should return empty array when no accounts found', async () => {
      mockAccountService.findAllByUser.mockResolvedValue([]);

      const result = await controller.findAll(mockAuthenticatedRequest);

      expect(accountService.findAllByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific account', async () => {
      mockAccountService.findOne.mockResolvedValue(mockAccount);

      const result = await controller.findOne(1, mockAuthenticatedRequest);

      expect(accountService.findOne).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockAccount);
    });

    it('should handle account not found', async () => {
      const error = new Error('Account not found');
      mockAccountService.findOne.mockRejectedValue(error);

      await expect(
        controller.findOne(999, mockAuthenticatedRequest),
      ).rejects.toThrow(error);
      expect(accountService.findOne).toHaveBeenCalledWith(999, 1);
    });
  });

  describe('update', () => {
    it('should update an account', async () => {
      const updateAccountDto: UpdateAccountDto = {
        name: 'Updated Account',
        description: 'Updated description',
      };

      const updatedAccount = { ...mockAccount, ...updateAccountDto };
      mockAccountService.update.mockResolvedValue(updatedAccount);

      const result = await controller.update(
        1,
        mockAuthenticatedRequest,
        updateAccountDto,
      );

      expect(accountService.update).toHaveBeenCalledWith(
        1,
        1,
        updateAccountDto,
      );
      expect(result).toEqual(updatedAccount);
    });

    it('should update account with partial data', async () => {
      const updateAccountDto: UpdateAccountDto = {
        name: 'Updated Name Only',
      };

      const updatedAccount = { ...mockAccount, name: 'Updated Name Only' };
      mockAccountService.update.mockResolvedValue(updatedAccount);

      const result = await controller.update(
        1,
        mockAuthenticatedRequest,
        updateAccountDto,
      );

      expect(accountService.update).toHaveBeenCalledWith(
        1,
        1,
        updateAccountDto,
      );
      expect(result).toEqual(updatedAccount);
    });
  });

  describe('remove', () => {
    it('should delete an account', async () => {
      mockAccountService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1, mockAuthenticatedRequest);

      expect(accountService.remove).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({ message: 'Account deleted successfully' });
    });

    it('should handle account not found during deletion', async () => {
      const error = new Error('Account not found');
      mockAccountService.remove.mockRejectedValue(error);

      await expect(
        controller.remove(999, mockAuthenticatedRequest),
      ).rejects.toThrow(error);
      expect(accountService.remove).toHaveBeenCalledWith(999, 1);
    });
  });
});
