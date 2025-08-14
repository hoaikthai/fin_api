import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

describe('AccountService', () => {
  let service: AccountService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    accounts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAccount: Account = {
    id: 1,
    name: 'Test Account',
    currency: 'USD',
    balance: 1000,
    description: 'Test description',
    isActive: true,
    userId: 1,
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createAccountDto: CreateAccountDto = {
      name: 'New Account',
      currency: 'EUR',
      balance: 500,
      description: 'New account description',
    };

    it('should create a new account with provided balance', async () => {
      const expectedAccount = {
        ...createAccountDto,
        userId: 1,
        balance: 500,
      };

      mockRepository.create.mockReturnValue(expectedAccount);
      mockRepository.save.mockResolvedValue({ ...expectedAccount, id: 2 });

      const result = await service.create(1, createAccountDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createAccountDto,
        userId: 1,
        balance: 500,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedAccount);
      expect(result).toEqual({ ...expectedAccount, id: 2 });
    });

    it('should create a new account with default balance when not provided', async () => {
      const createAccountDtoNoBalance: CreateAccountDto = {
        name: 'New Account',
        currency: 'EUR',
        description: 'New account description',
      };

      const expectedAccount = {
        ...createAccountDtoNoBalance,
        userId: 1,
        balance: 0,
      };

      mockRepository.create.mockReturnValue(expectedAccount);
      mockRepository.save.mockResolvedValue({ ...expectedAccount, id: 2 });

      const result = await service.create(1, createAccountDtoNoBalance);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createAccountDtoNoBalance,
        userId: 1,
        balance: 0,
      });
      expect(result).toEqual({ ...expectedAccount, id: 2 });
    });
  });

  describe('findAllByUser', () => {
    it('should return all accounts for a user', async () => {
      const mockAccounts = [
        mockAccount,
        { ...mockAccount, id: 2, name: 'Account 2' },
      ];
      mockRepository.find.mockResolvedValue(mockAccounts);

      const result = await service.findAllByUser(1);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockAccounts);
    });

    it('should return empty array when no accounts found', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAllByUser(1);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an account when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.findOne(1, 1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999, userId: 1 },
      });
    });

    it('should throw NotFoundException when account belongs to different user', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 999 },
      });
    });
  });

  describe('update', () => {
    const updateAccountDto: UpdateAccountDto = {
      name: 'Updated Account',
      description: 'Updated description',
    };

    it('should update and return the account', async () => {
      const updatedAccount = { ...mockAccount, ...updateAccountDto };

      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.save.mockResolvedValue(updatedAccount);

      const result = await service.update(1, 1, updateAccountDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedAccount);
      expect(result).toEqual(updatedAccount);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, 1, updateAccountDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove the account', async () => {
      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.remove.mockResolvedValue(mockAccount);

      await service.remove(1, 1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockAccount);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('updateBalance', () => {
    it('should update account balance', async () => {
      const updatedAccount = { ...mockAccount, balance: 2000 };

      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.save.mockResolvedValue(updatedAccount);

      const result = await service.updateBalance(1, 1, 2000);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockAccount,
        balance: 2000,
      });
      expect(result).toEqual(updatedAccount);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateBalance(999, 1, 2000)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
