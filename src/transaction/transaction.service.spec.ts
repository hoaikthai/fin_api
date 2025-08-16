import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction } from './transaction.entity';
import { TransactionType } from '../common/enums';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

describe('TransactionService', () => {
  let service: TransactionService;

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
    description: 'Test account',
    isActive: true,
    userId: mockUserId,
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoryId = crypto.randomUUID();
  const mockCategory: Category = {
    id: mockCategoryId,
    name: 'Test Category',
    type: TransactionType.EXPENSE,
    isDefault: false,
    userId: mockUserId,
    user: mockUser,
    parentId: null,
    parent: null,
    children: [],
    transactions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransactionId = crypto.randomUUID();
  const mockTransaction: Transaction = {
    id: mockTransactionId,
    type: TransactionType.EXPENSE,
    amount: 100,
    description: 'Test expense',
    categoryId: mockCategoryId,
    category: mockCategory,
    userId: mockUserId,
    accountId: mockAccountId,
    account: mockAccount,
    user: mockUser,
    transactionDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockAccountRepository = {
    findOne: jest.fn(),
  };

  const mockCategoryRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createIncomeDto: CreateTransactionDto = {
      type: TransactionType.INCOME,
      amount: 200,
      description: 'Test income',
      categoryId: crypto.randomUUID(),
      accountId: mockAccountId,
    };

    it('should create an income transaction', async () => {
      const incomeCategory = { ...mockCategory, type: TransactionType.INCOME };
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockCategoryRepository.findOne.mockResolvedValue(incomeCategory);
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.create(createIncomeDto, mockUserId);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId, userId: mockUserId },
      });
      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        ...createIncomeDto,
        userId: mockUserId,
        transactionDate: expect.any(Date) as Date,
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should use custom transaction date when provided', async () => {
      const customDate = new Date('2023-01-15');
      const createDtoWithDate: CreateTransactionDto = {
        ...createIncomeDto,
        transactionDate: customDate,
      };

      const incomeCategory = { ...mockCategory, type: TransactionType.INCOME };
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockCategoryRepository.findOne.mockResolvedValue(incomeCategory);
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      await service.create(createDtoWithDate, mockUserId);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        ...createDtoWithDate,
        userId: mockUserId,
        transactionDate: customDate,
      });
    });

    it('should throw NotFoundException when account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createIncomeDto, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all transactions for a user', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.findAll(mockUserId);

      expect(mockTransactionRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        relations: ['account', 'category'],
        order: { transactionDate: 'DESC' },
      });
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('findOne', () => {
    it('should return a transaction when found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne(mockTransactionId, mockUserId);

      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTransactionId, userId: mockUserId },
        relations: ['account', 'category'],
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(crypto.randomUUID(), mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateTransactionDto: UpdateTransactionDto = {
      description: 'Updated description',
      categoryId: crypto.randomUUID(),
    };

    it('should update and return the transaction', async () => {
      const updatedTransaction = {
        ...mockTransaction,
        ...updateTransactionDto,
      };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(updatedTransaction);

      const result = await service.update(
        mockTransactionId,
        updateTransactionDto,
        mockUserId,
      );

      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTransactionId, userId: mockUserId },
        relations: ['account', 'category'],
      });
      expect(mockTransactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateTransactionDto),
      );
      expect(result).toEqual(updatedTransaction);
    });

    it('should validate new account when accountId is updated', async () => {
      const newAccountId = crypto.randomUUID();
      const updateWithAccount: UpdateTransactionDto = {
        accountId: newAccountId,
      };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      await service.update(mockTransactionId, updateWithAccount, mockUserId);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: newAccountId, userId: mockUserId },
      });
    });

    it('should throw NotFoundException when transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(crypto.randomUUID(), updateTransactionDto, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when new account not found', async () => {
      const updateWithAccount: UpdateTransactionDto = {
        accountId: crypto.randomUUID(),
      };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(mockTransactionId, updateWithAccount, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the transaction', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.softRemove.mockResolvedValue(mockTransaction);

      await service.remove(mockTransactionId, mockUserId);

      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTransactionId, userId: mockUserId },
        relations: ['account', 'category'],
      });
      expect(mockTransactionRepository.softRemove).toHaveBeenCalledWith(
        mockTransaction,
      );
    });

    it('should throw NotFoundException when transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(crypto.randomUUID(), mockUserId),
      ).rejects.toThrow(NotFoundException);
      expect(mockTransactionRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('findByAccount', () => {
    it('should return transactions for a specific account', async () => {
      const mockTransactions = [mockTransaction];
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.findByAccount(mockAccountId, mockUserId);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId, userId: mockUserId },
      });
      expect(mockTransactionRepository.find).toHaveBeenCalledWith({
        where: { accountId: mockAccountId, userId: mockUserId },
        relations: ['account', 'category'],
        order: { transactionDate: 'DESC' },
      });
      expect(result).toEqual(mockTransactions);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findByAccount(crypto.randomUUID(), mockUserId),
      ).rejects.toThrow(NotFoundException);
      expect(mockTransactionRepository.find).not.toHaveBeenCalled();
    });
  });
});
