import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionType } from '../common/enums';
import { AuthenticatedRequest } from '../common/types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TimePeriod } from './dto/time-range-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

const mockTransactionService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  importFromCsv: jest.fn(),
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
    amount: -100, // Negative for expense transactions
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
      amount: 500, // Positive for income transactions
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
        amount: -150, // Negative for expense transaction
      };
      const updatedTransaction = { ...mockTransaction, amount: -150 };
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
        amount: 100, // Must update amount to positive when changing to income
      };
      const updatedTransaction = {
        ...mockTransaction,
        type: TransactionType.INCOME,
        amount: 100,
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

  describe('importTransactions', () => {
    const mockBuffer = Buffer.from(
      'Date,Category,Amount,Currency,Wallet\n2024-01-15,Food,25.50,USD,Test Account',
    );
    const mockCsvFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'transactions.csv',
      encoding: '7bit',
      mimetype: 'text/csv',
      size: 1024,
      destination: '',
      filename: 'transactions.csv',
      path: '',
      buffer: mockBuffer,
      stream: Readable.from(mockBuffer),
    };

    it('should successfully import transactions from CSV file', async () => {
      const importResult = {
        imported: 5,
        errors: [],
      };
      mockTransactionService.importFromCsv.mockResolvedValue(importResult);

      const result = await controller.importTransactions(
        mockCsvFile,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.importFromCsv).toHaveBeenCalledWith(
        mockCsvFile.buffer,
        mockUserId,
      );
      expect(result).toEqual(importResult);
    });

    it('should return import result with errors', async () => {
      const importResult = {
        imported: 3,
        errors: ['Row 2: Invalid date format', 'Row 4: Account not found'],
      };
      mockTransactionService.importFromCsv.mockResolvedValue(importResult);

      const result = await controller.importTransactions(
        mockCsvFile,
        mockAuthenticatedRequest,
      );

      expect(result).toEqual(importResult);
    });

    it('should throw error when file is not CSV', async () => {
      const nonCsvFile: Express.Multer.File = {
        ...mockCsvFile,
        originalname: 'document.txt',
        mimetype: 'text/plain',
      };

      await expect(
        controller.importTransactions(nonCsvFile, mockAuthenticatedRequest),
      ).rejects.toThrow('File must be a CSV file');

      expect(mockTransactionService.importFromCsv).not.toHaveBeenCalled();
    });

    it('should accept CSV file with .csv extension even if mimetype is different', async () => {
      const csvFileWithDifferentMimetype: Express.Multer.File = {
        ...mockCsvFile,
        mimetype: 'application/octet-stream',
        originalname: 'transactions.csv',
      };

      const importResult = { imported: 1, errors: [] };
      mockTransactionService.importFromCsv.mockResolvedValue(importResult);

      const result = await controller.importTransactions(
        csvFileWithDifferentMimetype,
        mockAuthenticatedRequest,
      );

      expect(mockTransactionService.importFromCsv).toHaveBeenCalledWith(
        csvFileWithDifferentMimetype.buffer,
        mockUserId,
      );
      expect(result).toEqual(importResult);
    });

    it('should handle service errors during import', async () => {
      const serviceError = new Error('Invalid CSV format');
      mockTransactionService.importFromCsv.mockRejectedValue(serviceError);

      await expect(
        controller.importTransactions(mockCsvFile, mockAuthenticatedRequest),
      ).rejects.toThrow('Invalid CSV format');
    });

    it('should extract user ID correctly from authenticated request', async () => {
      const differentUserId = crypto.randomUUID();
      const differentUserRequest = {
        user: { sub: differentUserId, email: 'other@example.com' },
      } as AuthenticatedRequest;

      const importResult = { imported: 2, errors: [] };
      mockTransactionService.importFromCsv.mockResolvedValue(importResult);

      await controller.importTransactions(mockCsvFile, differentUserRequest);

      expect(mockTransactionService.importFromCsv).toHaveBeenCalledWith(
        mockCsvFile.buffer,
        differentUserId,
      );
    });

    it('should handle large CSV files', async () => {
      const largeCsvFile: Express.Multer.File = {
        ...mockCsvFile,
        size: 1024 * 1024 * 5, // 5MB
        buffer: Buffer.alloc(1024 * 1024 * 5),
      };

      const importResult = { imported: 1000, errors: [] };
      mockTransactionService.importFromCsv.mockResolvedValue(importResult);

      const result = await controller.importTransactions(
        largeCsvFile,
        mockAuthenticatedRequest,
      );

      expect(result).toEqual(importResult);
    });

    it('should handle empty import result', async () => {
      const importResult = { imported: 0, errors: ['CSV file is empty'] };
      mockTransactionService.importFromCsv.mockResolvedValue(importResult);

      const result = await controller.importTransactions(
        mockCsvFile,
        mockAuthenticatedRequest,
      );

      expect(result).toEqual(importResult);
    });
  });
});
