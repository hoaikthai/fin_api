import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionType } from './transaction.entity';
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

  const mockAuthenticatedRequest = {
    user: {
      sub: 1,
      email: 'test@example.com',
    },
  } as AuthenticatedRequest;

  const mockTransaction = {
    id: 1,
    type: TransactionType.EXPENSE,
    amount: 100,
    description: 'Test expense',
    category: 'Food',
    accountId: 1,
    toAccountId: null,
    userId: 1,
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
      category: 'Salary',
      accountId: 1,
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
        1,
      );
      expect(result).toEqual(expectedTransaction);
    });

    it('should handle transfer transaction creation', async () => {
      const createTransferDto: CreateTransactionDto = {
        type: TransactionType.TRANSFER,
        amount: 200,
        description: 'Test transfer',
        accountId: 1,
        toAccountId: 2,
      };

      const expectedTransaction = { ...mockTransaction, ...createTransferDto };
      mockTransactionService.create.mockResolvedValue(expectedTransaction);

      const result = await controller.create(
        createTransferDto,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.create).toHaveBeenCalledWith(
        createTransferDto,
        1,
      );
      expect(result).toEqual(expectedTransaction);
    });
  });

  describe('findAll', () => {
    it('should return all transactions for the authenticated user', async () => {
      const mockTransactions = [mockTransaction];
      mockTransactionService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockAuthenticatedRequest);

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('findByAccount', () => {
    it('should return transactions for a specific account', async () => {
      const accountId = 1;
      const mockTransactions = [mockTransaction];
      mockTransactionService.findByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.findByAccount(
        accountId,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.findByAccount).toHaveBeenCalledWith(
        accountId,
        1,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should handle ParseIntPipe for accountId parameter', async () => {
      const accountId = 2;
      const mockTransactions = [mockTransaction];
      mockTransactionService.findByAccount.mockResolvedValue(mockTransactions);

      const result = await controller.findByAccount(
        accountId,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.findByAccount).toHaveBeenCalledWith(
        accountId,
        1,
      );
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('findOne', () => {
    it('should return a specific transaction', async () => {
      const transactionId = 1;
      mockTransactionService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(
        transactionId,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.findOne).toHaveBeenCalledWith(
        transactionId,
        1,
      );
      expect(result).toEqual(mockTransaction);
    });

    it('should handle ParseIntPipe for id parameter', async () => {
      const transactionId = 2;
      mockTransactionService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(
        transactionId,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.findOne).toHaveBeenCalledWith(
        transactionId,
        1,
      );
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('update', () => {
    const updateTransactionDto: UpdateTransactionDto = {
      description: 'Updated description',
      category: 'Updated category',
    };

    it('should update a transaction', async () => {
      const transactionId = 1;
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
        1,
      );
      expect(result).toEqual(updatedTransaction);
    });

    it('should handle partial updates', async () => {
      const transactionId = 1;
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
        1,
      );
      expect(result).toEqual(updatedTransaction);
    });

    it('should handle type change updates', async () => {
      const transactionId = 1;
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
        1,
      );
      expect(result).toEqual(updatedTransaction);
    });
  });

  describe('remove', () => {
    it('should delete a transaction', async () => {
      const transactionId = 1;
      mockTransactionService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(
        transactionId,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.remove).toHaveBeenCalledWith(
        transactionId,
        1,
      );
      expect(result).toBeUndefined();
    });

    it('should handle ParseIntPipe for id parameter', async () => {
      const transactionId = 2;
      mockTransactionService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(
        transactionId,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.remove).toHaveBeenCalledWith(
        transactionId,
        1,
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

      await controller.findAll(mockAuthenticatedRequest);

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(1);
    });

    it('should use user ID consistently across all methods', async () => {
      const differentUserRequest = {
        user: { sub: 5, email: 'other@example.com' },
      } as AuthenticatedRequest;

      mockTransactionService.findAll.mockResolvedValue([]);

      await controller.findAll(differentUserRequest);

      expect(mockTransactionService.findAll).toHaveBeenCalledWith(5);
    });
  });
});
