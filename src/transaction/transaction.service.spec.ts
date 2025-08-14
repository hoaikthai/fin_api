import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction, TransactionType } from './transaction.entity';
import { Account } from '../account/account.entity';
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

  const mockToAccountId = crypto.randomUUID();
  const mockToAccount: Account = {
    id: mockToAccountId,
    name: 'Destination Account',
    currency: 'USD',
    balance: 500,
    description: 'Destination account',
    isActive: true,
    userId: mockUserId,
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransactionId = crypto.randomUUID();
  const mockTransaction: Transaction = {
    id: mockTransactionId,
    type: TransactionType.EXPENSE,
    amount: 100,
    description: 'Test expense',
    category: 'Food',
    userId: mockUserId,
    accountId: mockAccountId,
    toAccountId: null,
    account: mockAccount,
    toAccount: null,
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
  };

  const mockAccountRepository = {
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
      category: 'Salary',
      accountId: mockAccountId,
    };

    it('should create an income transaction', async () => {
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
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

    it('should create a transfer transaction with destination account', async () => {
      const createTransferDto: CreateTransactionDto = {
        type: TransactionType.TRANSFER,
        amount: 100,
        description: 'Test transfer',
        accountId: mockAccountId,
        toAccountId: mockToAccountId,
      };

      mockAccountRepository.findOne
        .mockResolvedValueOnce(mockAccount)
        .mockResolvedValueOnce(mockToAccount);
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.create(createTransferDto, mockUserId);

      expect(mockAccountRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockAccountRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: mockAccountId, userId: mockUserId },
      });
      expect(mockAccountRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: mockToAccountId, userId: mockUserId },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should use custom transaction date when provided', async () => {
      const customDate = new Date('2023-01-15');
      const createDtoWithDate: CreateTransactionDto = {
        ...createIncomeDto,
        transactionDate: customDate,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
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

    it('should throw BadRequestException for transfer without destination account', async () => {
      const createTransferDto: CreateTransactionDto = {
        type: TransactionType.TRANSFER,
        amount: 100,
        description: 'Test transfer',
        accountId: mockAccountId,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      await expect(
        service.create(createTransferDto, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when destination account not found', async () => {
      const createTransferDto: CreateTransactionDto = {
        type: TransactionType.TRANSFER,
        amount: 100,
        description: 'Test transfer',
        accountId: mockAccountId,
        toAccountId: crypto.randomUUID(),
      };

      mockAccountRepository.findOne
        .mockResolvedValueOnce(mockAccount)
        .mockResolvedValueOnce(null);

      await expect(
        service.create(createTransferDto, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for transfer to same account', async () => {
      const createTransferDto: CreateTransactionDto = {
        type: TransactionType.TRANSFER,
        amount: 100,
        description: 'Test transfer',
        accountId: mockAccountId,
        toAccountId: mockAccountId,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      await expect(
        service.create(createTransferDto, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-transfer with destination account', async () => {
      const createIncomeWithToAccount: CreateTransactionDto = {
        type: TransactionType.INCOME,
        amount: 100,
        description: 'Test income',
        accountId: mockAccountId,
        toAccountId: mockToAccountId,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      await expect(
        service.create(createIncomeWithToAccount, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all transactions for a user', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.findAll(mockUserId);

      expect(mockTransactionRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        relations: ['account', 'toAccount'],
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
        relations: ['account', 'toAccount'],
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
      category: 'Updated category',
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
        relations: ['account', 'toAccount'],
      });
      expect(mockTransactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateTransactionDto),
      );
      expect(result).toEqual(updatedTransaction);
    });

    it('should validate new account when accountId is updated', async () => {
      const updateWithAccount: UpdateTransactionDto = {
        accountId: mockToAccountId,
      };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockAccountRepository.findOne.mockResolvedValue(mockToAccount);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      await service.update(mockTransactionId, updateWithAccount, mockUserId);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockToAccountId, userId: mockUserId },
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

    it('should throw BadRequestException for transfer without destination account', async () => {
      const updateToTransfer: UpdateTransactionDto = {
        type: TransactionType.TRANSFER,
      };

      const mockExpenseTransaction = {
        ...mockTransaction,
        type: TransactionType.EXPENSE,
        toAccountId: null,
      } as Transaction;

      mockTransactionRepository.findOne.mockResolvedValue(
        mockExpenseTransaction,
      );

      await expect(
        service.update(mockTransactionId, updateToTransfer, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove the transaction', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.remove.mockResolvedValue(mockTransaction);

      await service.remove(mockTransactionId, mockUserId);

      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTransactionId, userId: mockUserId },
        relations: ['account', 'toAccount'],
      });
      expect(mockTransactionRepository.remove).toHaveBeenCalledWith(
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
        where: [
          { accountId: mockAccountId, userId: mockUserId },
          { toAccountId: mockAccountId, userId: mockUserId },
        ],
        relations: ['account', 'toAccount'],
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
