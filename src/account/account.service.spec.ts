import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

describe('AccountService', () => {
  let service: AccountService;

  const mockUserId = crypto.randomUUID();
  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    password: 'hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    accounts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAccountId = crypto.randomUUID();
  const mockAccount: Account = {
    id: mockAccountId,
    name: 'Test Account',
    currency: 'USD',
    balance: 1000,
    description: 'Test description',
    isActive: true,
    userId: mockUserId,
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
        userId: mockUserId,
        balance: 500,
      };

      mockRepository.create.mockReturnValue(expectedAccount);
      const newAccountId = crypto.randomUUID();
      mockRepository.save.mockResolvedValue({
        ...expectedAccount,
        id: newAccountId,
      });

      const result = await service.create(mockUserId, createAccountDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createAccountDto,
        userId: mockUserId,
        balance: 500,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedAccount);
      expect(result).toEqual({ ...expectedAccount, id: newAccountId });
    });

    it('should create a new account with default balance when not provided', async () => {
      const createAccountDtoNoBalance: CreateAccountDto = {
        name: 'New Account',
        currency: 'EUR',
        description: 'New account description',
      };

      const expectedAccount = {
        ...createAccountDtoNoBalance,
        userId: mockUserId,
        balance: 0,
      };

      mockRepository.create.mockReturnValue(expectedAccount);
      const newAccountId = crypto.randomUUID();
      mockRepository.save.mockResolvedValue({
        ...expectedAccount,
        id: newAccountId,
      });

      const result = await service.create(
        mockUserId,
        createAccountDtoNoBalance,
      );

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createAccountDtoNoBalance,
        userId: mockUserId,
        balance: 0,
      });
      expect(result).toEqual({ ...expectedAccount, id: newAccountId });
    });
  });

  describe('findAllByUser', () => {
    it('should return all accounts for a user', async () => {
      const mockAccounts = [
        mockAccount,
        { ...mockAccount, id: crypto.randomUUID(), name: 'Account 2' },
      ];
      mockRepository.find.mockResolvedValue(mockAccounts);

      const result = await service.findAllByUser(mockUserId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockAccounts);
    });

    it('should return empty array when no accounts found', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAllByUser(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an account when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.findOne(mockAccountId, mockUserId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId, userId: mockUserId },
      });
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const nonExistentId = crypto.randomUUID();
      await expect(service.findOne(nonExistentId, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: nonExistentId, userId: mockUserId },
      });
    });

    it('should throw NotFoundException when account belongs to different user', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const differentUserId = crypto.randomUUID();
      await expect(
        service.findOne(mockAccountId, differentUserId),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId, userId: differentUserId },
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

      const result = await service.update(
        mockAccountId,
        mockUserId,
        updateAccountDto,
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId, userId: mockUserId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedAccount);
      expect(result).toEqual(updatedAccount);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const nonExistentAccountId = crypto.randomUUID();
      await expect(
        service.update(nonExistentAccountId, mockUserId, updateAccountDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove the account', async () => {
      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.remove.mockResolvedValue(mockAccount);

      await service.remove(mockAccountId, mockUserId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId, userId: mockUserId },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockAccount);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const nonExistentId2 = crypto.randomUUID();
      await expect(service.remove(nonExistentId2, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('updateBalance', () => {
    it('should update account balance', async () => {
      const updatedAccount = { ...mockAccount, balance: 2000 };

      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.save.mockResolvedValue(updatedAccount);

      const result = await service.updateBalance(
        mockAccountId,
        mockUserId,
        2000,
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId, userId: mockUserId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockAccount,
        balance: 2000,
      });
      expect(result).toEqual(updatedAccount);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const nonExistentId3 = crypto.randomUUID();
      await expect(
        service.updateBalance(nonExistentId3, mockUserId, 2000),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
