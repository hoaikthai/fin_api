import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TimePeriod } from './dto/time-range-query.dto';
import { TransactionType } from '../common/enums';
import { AuthenticatedRequest } from '../common/types';

const mockTransactionService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByAccount: jest.fn(),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('TransactionController', () => {
  let controller: TransactionController;

  const mockUserId = crypto.randomUUID();
  const mockAuthenticatedRequest = {
    user: {
      sub: mockUserId,
      email: 'test@example.com',
    },
  } as AuthenticatedRequest;

  const mockTransactionId = crypto.randomUUID();
  const mockAccountId = crypto.randomUUID();
  const mockTransaction = {
    id: mockTransactionId,
    type: TransactionType.EXPENSE,
    amount: 100,
    description: 'Test expense',
    categoryId: crypto.randomUUID(),
    accountId: mockAccountId,
    userId: mockUserId,
    transactionDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTransactionDto: CreateTransactionDto = {
      type: TransactionType.INCOME,
      amount: 500,
      description: 'Test income',
      categoryId: crypto.randomUUID(),
      accountId: mockAccountId,
    };

    it('should create a new transaction', async () => {
      const expectedTransaction = {
        ...mockTransaction,
        ...createTransactionDto,
      };
      mockTransactionService.create.mockResolvedValue(expectedTransaction);

      const result = await controller.create(
        createTransactionDto,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.create).toHaveBeenCalledWith(
        createTransactionDto,
        mockUserId,
      );
      expect(result).toEqual(expectedTransaction);
    });
  });

  describe('findAll', () => {
    it('should return all transactions for the authenticated user with default month period', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest, {});

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.MONTH,
        0,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return transactions filtered by day period', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest, {
        period: TimePeriod.DAY,
      });

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.DAY,
        0,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return transactions filtered by week period', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest, {
        period: TimePeriod.WEEK,
      });

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.WEEK,
        0,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return transactions filtered by quarter period', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest, {
        period: TimePeriod.QUARTER,
      });

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.QUARTER,
        0,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return transactions filtered by year period', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest, {
        period: TimePeriod.YEAR,
      });

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.YEAR,
        0,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return transactions for last month with offset -1', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest, {
        period: TimePeriod.MONTH,
        offset: -1,
      });

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.MONTH,
        -1,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return transactions for 3 months ago with offset -3', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest, {
        period: TimePeriod.MONTH,
        offset: -3,
      });

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.MONTH,
        -3,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return transactions for last week with offset -1', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest, {
        period: TimePeriod.WEEK,
        offset: -1,
      });

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.WEEK,
        -1,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return transactions for next month with positive offset 1', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest, {
        period: TimePeriod.MONTH,
        offset: 1,
      });

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.MONTH,
        1,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return transactions for next week with positive offset 1', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest, {
        period: TimePeriod.WEEK,
        offset: 1,
      });

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.WEEK,
        1,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return transactions for 2 months in the future with offset 2', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest, {
        period: TimePeriod.MONTH,
        offset: 2,
      });

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.MONTH,
        2,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return transactions for next year with positive offset 1', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest, {
        period: TimePeriod.YEAR,
        offset: 1,
      });

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.YEAR,
        1,
      );
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('findByAccount', () => {
    it('should return transactions for a specific account with default month period', async () => {
      const accountId = mockAccountId;
      const mockTransactions = [mockTransaction];
      mockTransactionService.findByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.findByAccount(
        accountId,
        mockAuthenticatedRequest,
        {},
      );

      expect(mockTransactionService.findByAccount).toHaveBeenCalledWith(
        accountId,
        mockUserId,
        TimePeriod.MONTH,
        0,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return account transactions filtered by day period', async () => {
      const accountId = mockAccountId;
      const mockTransactions = [mockTransaction];
      mockTransactionService.findByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.findByAccount(
        accountId,
        mockAuthenticatedRequest,
        { period: TimePeriod.DAY },
      );

      expect(mockTransactionService.findByAccount).toHaveBeenCalledWith(
        accountId,
        mockUserId,
        TimePeriod.DAY,
        0,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return account transactions filtered by week period', async () => {
      const accountId = mockAccountId;
      const mockTransactions = [mockTransaction];
      mockTransactionService.findByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.findByAccount(
        accountId,
        mockAuthenticatedRequest,
        { period: TimePeriod.WEEK },
      );

      expect(mockTransactionService.findByAccount).toHaveBeenCalledWith(
        accountId,
        mockUserId,
        TimePeriod.WEEK,
        0,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return account transactions filtered by quarter period', async () => {
      const accountId = mockAccountId;
      const mockTransactions = [mockTransaction];
      mockTransactionService.findByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.findByAccount(
        accountId,
        mockAuthenticatedRequest,
        { period: TimePeriod.QUARTER },
      );

      expect(mockTransactionService.findByAccount).toHaveBeenCalledWith(
        accountId,
        mockUserId,
        TimePeriod.QUARTER,
        0,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return account transactions filtered by year period', async () => {
      const accountId = mockAccountId;
      const mockTransactions = [mockTransaction];
      mockTransactionService.findByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.findByAccount(
        accountId,
        mockAuthenticatedRequest,
        { period: TimePeriod.YEAR },
      );

      expect(mockTransactionService.findByAccount).toHaveBeenCalledWith(
        accountId,
        mockUserId,
        TimePeriod.YEAR,
        0,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should handle ParseUUIDPipe for accountId parameter', async () => {
      const accountId = crypto.randomUUID();
      const mockTransactions = [mockTransaction];
      mockTransactionService.findByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.findByAccount(
        accountId,
        mockAuthenticatedRequest,
        {},
      );

      expect(mockTransactionService.findByAccount).toHaveBeenCalledWith(
        accountId,
        mockUserId,
        TimePeriod.MONTH,
        0,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return account transactions for last month with offset -1', async () => {
      const accountId = mockAccountId;
      const mockTransactions = [mockTransaction];
      mockTransactionService.findByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.findByAccount(
        accountId,
        mockAuthenticatedRequest,
        { period: TimePeriod.MONTH, offset: -1 },
      );

      expect(mockTransactionService.findByAccount).toHaveBeenCalledWith(
        accountId,
        mockUserId,
        TimePeriod.MONTH,
        -1,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return account transactions for last quarter with offset -1', async () => {
      const accountId = mockAccountId;
      const mockTransactions = [mockTransaction];
      mockTransactionService.findByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.findByAccount(
        accountId,
        mockAuthenticatedRequest,
        { period: TimePeriod.QUARTER, offset: -1 },
      );

      expect(mockTransactionService.findByAccount).toHaveBeenCalledWith(
        accountId,
        mockUserId,
        TimePeriod.QUARTER,
        -1,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return account transactions for next month with positive offset 1', async () => {
      const accountId = mockAccountId;
      const mockTransactions = [mockTransaction];
      mockTransactionService.findByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.findByAccount(
        accountId,
        mockAuthenticatedRequest,
        { period: TimePeriod.MONTH, offset: 1 },
      );

      expect(mockTransactionService.findByAccount).toHaveBeenCalledWith(
        accountId,
        mockUserId,
        TimePeriod.MONTH,
        1,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should return account transactions for next quarter with positive offset 1', async () => {
      const accountId = mockAccountId;
      const mockTransactions = [mockTransaction];
      mockTransactionService.findByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.findByAccount(
        accountId,
        mockAuthenticatedRequest,
        { period: TimePeriod.QUARTER, offset: 1 },
      );

      expect(mockTransactionService.findByAccount).toHaveBeenCalledWith(
        accountId,
        mockUserId,
        TimePeriod.QUARTER,
        1,
      );
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('findOne', () => {
    it('should return a specific transaction', async () => {
      const transactionId = mockTransactionId;
      mockTransactionService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(
        transactionId,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.findOne).toHaveBeenCalledWith(
        transactionId,
        mockUserId,
      );
      expect(result).toEqual(mockTransaction);
    });

    it('should handle ParseIntPipe for id parameter', async () => {
      const transactionId = crypto.randomUUID();
      mockTransactionService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(
        transactionId,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.findOne).toHaveBeenCalledWith(
        transactionId,
        mockUserId,
      );
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('update', () => {
    const updateTransactionDto: UpdateTransactionDto = {
      description: 'Updated description',
      categoryId: crypto.randomUUID(),
    };

    it('should update a transaction', async () => {
      const transactionId = mockTransactionId;
      const updatedTransaction = {
        ...mockTransaction,
        ...updateTransactionDto,
      };
      mockTransactionService.update.mockResolvedValue(updatedTransaction);

      const result = await controller.update(
        transactionId,
        updateTransactionDto,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.update).toHaveBeenCalledWith(
        transactionId,
        updateTransactionDto,
        mockUserId,
      );
      expect(result).toEqual(updatedTransaction);
    });

    it('should handle partial updates', async () => {
      const transactionId = mockTransactionId;
      const partialUpdateDto: UpdateTransactionDto = {
        amount: 150,
      };
      const updatedTransaction = { ...mockTransaction, amount: 150 };
      mockTransactionService.update.mockResolvedValue(updatedTransaction);

      const result = await controller.update(
        transactionId,
        partialUpdateDto,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.update).toHaveBeenCalledWith(
        transactionId,
        partialUpdateDto,
        mockUserId,
      );
      expect(result).toEqual(updatedTransaction);
    });

    it('should handle type change updates', async () => {
      const transactionId = mockTransactionId;
      const typeUpdateDto: UpdateTransactionDto = {
        type: TransactionType.INCOME,
      };
      const updatedTransaction = {
        ...mockTransaction,
        type: TransactionType.INCOME,
      };
      mockTransactionService.update.mockResolvedValue(updatedTransaction);

      const result = await controller.update(
        transactionId,
        typeUpdateDto,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.update).toHaveBeenCalledWith(
        transactionId,
        typeUpdateDto,
        mockUserId,
      );
      expect(result).toEqual(updatedTransaction);
    });
  });

  describe('remove', () => {
    it('should delete a transaction', async () => {
      const transactionId = mockTransactionId;
      mockTransactionService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(
        transactionId,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.remove).toHaveBeenCalledWith(
        transactionId,
        mockUserId,
      );
      expect(result).toBeUndefined();
    });

    it('should handle ParseIntPipe for id parameter', async () => {
      const transactionId = crypto.randomUUID();
      mockTransactionService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(
        transactionId,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.remove).toHaveBeenCalledWith(
        transactionId,
        mockUserId,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('Guard protection', () => {
    it('should be protected by JwtAuthGuard', () => {
      expect(mockJwtAuthGuard.canActivate).toBeDefined();
    });
  });

  describe('User context extraction', () => {
    it('should extract user ID from authenticated request', async () => {
      mockTransactionService.findAll.mockResolvedValue([]);

      await controller.findAll(mockAuthenticatedRequest, {});

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        mockUserId,
        TimePeriod.MONTH,
        0,
      );
    });

    it('should use user ID consistently across all methods', async () => {
      const differentUserId = crypto.randomUUID();
      const differentUserRequest = {
        user: { sub: differentUserId, email: 'other@example.com' },
      } as AuthenticatedRequest;

      mockTransactionService.findAll.mockResolvedValue([]);

      await controller.findAll(differentUserRequest, {});

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(
        differentUserId,
        TimePeriod.MONTH,
        0,
      );
    });
  });
});
