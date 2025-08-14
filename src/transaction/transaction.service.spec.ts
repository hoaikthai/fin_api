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
    description: 'Test account',
    isActive: true,
    userId: 1,
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockToAccount: Account = {
    id: 2,
    name: 'Destination Account',
    currency: 'USD',
    balance: 500,
    description: 'Destination account',
    isActive: true,
    userId: 1,
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransaction: Transaction = {
    id: 1,
    type: TransactionType.EXPENSE,
    amount: 100,
    description: 'Test expense',
    category: 'Food',
    userId: 1,
    accountId: 1,
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
      accountId: 1,
    };

    it('should create an income transaction', async () => {
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.create(createIncomeDto, 1);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        ...createIncomeDto,
        userId: 1,
        transactionDate: expect.any(Date) as Date,
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should create a transfer transaction with destination account', async () => {
      const createTransferDto: CreateTransactionDto = {
        type: TransactionType.TRANSFER,
        amount: 100,
        description: 'Test transfer',
        accountId: 1,
        toAccountId: 2,
      };

      mockAccountRepository.findOne
        .mockResolvedValueOnce(mockAccount)
        .mockResolvedValueOnce(mockToAccount);
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.create(createTransferDto, 1);

      expect(mockAccountRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockAccountRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: 1, userId: 1 },
      });
      expect(mockAccountRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: 2, userId: 1 },
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

      await service.create(createDtoWithDate, 1);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        ...createDtoWithDate,
        userId: 1,
        transactionDate: customDate,
      });
    });

    it('should throw NotFoundException when account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createIncomeDto, 1)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for transfer without destination account', async () => {
      const createTransferDto: CreateTransactionDto = {
        type: TransactionType.TRANSFER,
        amount: 100,
        description: 'Test transfer',
        accountId: 1,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      await expect(service.create(createTransferDto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when destination account not found', async () => {
      const createTransferDto: CreateTransactionDto = {
        type: TransactionType.TRANSFER,
        amount: 100,
        description: 'Test transfer',
        accountId: 1,
        toAccountId: 999,
      };

      mockAccountRepository.findOne
        .mockResolvedValueOnce(mockAccount)
        .mockResolvedValueOnce(null);

      await expect(service.create(createTransferDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for transfer to same account', async () => {
      const createTransferDto: CreateTransactionDto = {
        type: TransactionType.TRANSFER,
        amount: 100,
        description: 'Test transfer',
        accountId: 1,
        toAccountId: 1,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      await expect(service.create(createTransferDto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-transfer with destination account', async () => {
      const createIncomeWithToAccount: CreateTransactionDto = {
        type: TransactionType.INCOME,
        amount: 100,
        description: 'Test income',
        accountId: 1,
        toAccountId: 2,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      await expect(
        service.create(createIncomeWithToAccount, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all transactions for a user', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.findAll(1);

      expect(mockTransactionRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['account', 'toAccount'],
        order: { transactionDate: 'DESC' },
      });
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('findOne', () => {
    it('should return a transaction when found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne(1, 1);

      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
        relations: ['account', 'toAccount'],
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
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

      const result = await service.update(1, updateTransactionDto, 1);

      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
        relations: ['account', 'toAccount'],
      });
      expect(mockTransactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateTransactionDto),
      );
      expect(result).toEqual(updatedTransaction);
    });

    it('should validate new account when accountId is updated', async () => {
      const updateWithAccount: UpdateTransactionDto = {
        accountId: 2,
      };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockAccountRepository.findOne.mockResolvedValue(mockToAccount);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      await service.update(1, updateWithAccount, 1);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2, userId: 1 },
      });
    });

    it('should throw NotFoundException when transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, updateTransactionDto, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when new account not found', async () => {
      const updateWithAccount: UpdateTransactionDto = {
        accountId: 999,
      };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateWithAccount, 1)).rejects.toThrow(
        NotFoundException,
      );
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

      await expect(service.update(1, updateToTransfer, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should remove the transaction', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.remove.mockResolvedValue(mockTransaction);

      await service.remove(1, 1);

      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
        relations: ['account', 'toAccount'],
      });
      expect(mockTransactionRepository.remove).toHaveBeenCalledWith(
        mockTransaction,
      );
    });

    it('should throw NotFoundException when transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
      expect(mockTransactionRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('findByAccount', () => {
    it('should return transactions for a specific account', async () => {
      const mockTransactions = [mockTransaction];
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.findByAccount(1, 1);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(mockTransactionRepository.find).toHaveBeenCalledWith({
        where: [
          { accountId: 1, userId: 1 },
          { toAccountId: 1, userId: 1 },
        ],
        relations: ['account', 'toAccount'],
        order: { transactionDate: 'DESC' },
      });
      expect(result).toEqual(mockTransactions);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.findByAccount(999, 1)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTransactionRepository.find).not.toHaveBeenCalled();
    });
  });
});
