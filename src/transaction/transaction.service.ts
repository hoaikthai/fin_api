import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { TransactionType } from '../common/enums';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CsvRowDto } from './dto/csv-import.dto';
import { TimePeriod } from './dto/time-range-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  private getDateRange(period?: TimePeriod, offset = 0): Date {
    const effectivePeriod = period ?? TimePeriod.MONTH;
    const now = new Date();

    switch (effectivePeriod) {
      case TimePeriod.DAY: {
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        startOfDay.setDate(startOfDay.getDate() + offset);
        return startOfDay;
      }
      case TimePeriod.WEEK: {
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        startOfWeek.setDate(startOfWeek.getDate() + offset * 7);
        return startOfWeek;
      }
      case TimePeriod.QUARTER: {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const targetQuarter = currentQuarter + offset;
        const year = now.getFullYear() + Math.floor(targetQuarter / 4);
        const adjustedQuarter = ((targetQuarter % 4) + 4) % 4;
        const quarterStartMonth = adjustedQuarter * 3;
        return new Date(year, quarterStartMonth, 1);
      }
      case TimePeriod.YEAR: {
        return new Date(now.getFullYear() + offset, 0, 1);
      }
      default: {
        const month = now.getMonth() + offset;
        const year = now.getFullYear() + Math.floor(month / 12);
        const adjustedMonth = ((month % 12) + 12) % 12;
        return new Date(year, adjustedMonth, 1);
      }
    }
  }

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    const { accountId, type, categoryId } = createTransactionDto;

    const account = await this.accountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.isDefault && category.userId !== userId) {
      throw new BadRequestException('Access denied to this category');
    }

    if (category.type !== type) {
      throw new BadRequestException(
        'Category type must match transaction type',
      );
    }

    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      userId,
      transactionDate: createTransactionDto.transactionDate ?? new Date(),
    });

    return this.transactionRepository.save(transaction);
  }

  async findAll(
    userId: string,
    period?: TimePeriod,
    offset = 0,
  ): Promise<Transaction[]> {
    const fromDate = this.getDateRange(period, offset);
    const whereCondition = {
      userId,
      transactionDate: MoreThanOrEqual(fromDate),
    };

    return this.transactionRepository.find({
      where: whereCondition,
      relations: ['account', 'category'],
      order: { transactionDate: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['account', 'category'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);

    if (updateTransactionDto.accountId) {
      const account = await this.accountRepository.findOne({
        where: { id: updateTransactionDto.accountId, userId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }
    }

    if (updateTransactionDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateTransactionDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (!category.isDefault && category.userId !== userId) {
        throw new BadRequestException('Access denied to this category');
      }
    }

    // Apply business rule validation for amount signs
    const finalType = updateTransactionDto.type ?? transaction.type;
    const finalAmount = updateTransactionDto.amount ?? transaction.amount;

    if (finalType === TransactionType.INCOME && finalAmount <= 0) {
      throw new BadRequestException(
        'Amount must be positive for income transactions',
      );
    }

    if (finalType === TransactionType.EXPENSE && finalAmount >= 0) {
      throw new BadRequestException(
        'Amount must be negative for expense transactions',
      );
    }

    Object.assign(transaction, updateTransactionDto);
    return this.transactionRepository.save(transaction);
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findOne(id, userId);
    await this.transactionRepository.softRemove(transaction);
  }

  async findByAccount(
    accountId: string,
    userId: string,
    period?: TimePeriod,
    offset = 0,
  ): Promise<Transaction[]> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const fromDate = this.getDateRange(period, offset);
    const whereCondition = {
      accountId,
      userId,
      transactionDate: MoreThanOrEqual(fromDate),
    };

    return this.transactionRepository.find({
      where: whereCondition,
      relations: ['account', 'category'],
      order: { transactionDate: 'DESC' },
    });
  }

  async transfer(
    createTransferDto: CreateTransferDto,
    userId: string,
  ): Promise<{
    sourceTransaction: Transaction;
    destinationTransaction: Transaction;
  }> {
    const {
      sourceAccountId,
      destinationAccountId,
      amount,
      description,
      transactionDate,
    } = createTransferDto;

    if (sourceAccountId === destinationAccountId) {
      throw new BadRequestException(
        'Source and destination accounts cannot be the same',
      );
    }

    const sourceAccount = await this.accountRepository.findOne({
      where: { id: sourceAccountId, userId },
    });

    if (!sourceAccount) {
      throw new NotFoundException('Source account not found');
    }

    const destinationAccount = await this.accountRepository.findOne({
      where: { id: destinationAccountId, userId },
    });

    if (!destinationAccount) {
      throw new NotFoundException('Destination account not found');
    }

    const outgoingTransferCategory = await this.categoryRepository.findOne({
      where: {
        name: 'Outgoing transfer',
        isDefault: true,
        type: TransactionType.EXPENSE,
      },
    });

    if (!outgoingTransferCategory) {
      throw new NotFoundException('Outgoing transfer category not found');
    }

    const incomingTransferCategory = await this.categoryRepository.findOne({
      where: {
        name: 'Incoming transfer',
        isDefault: true,
        type: TransactionType.INCOME,
      },
    });

    if (!incomingTransferCategory) {
      throw new NotFoundException('Incoming transfer category not found');
    }

    const sourceTransactionData: CreateTransactionDto = {
      type: TransactionType.EXPENSE,
      amount: -Math.abs(amount), // Ensure negative for expense
      description,
      categoryId: outgoingTransferCategory.id,
      accountId: sourceAccountId,
      transactionDate,
    };

    const destinationTransactionData: CreateTransactionDto = {
      type: TransactionType.INCOME,
      amount: Math.abs(amount), // Ensure positive for income
      description,
      categoryId: incomingTransferCategory.id,
      accountId: destinationAccountId,
      transactionDate,
    };

    const sourceTransaction = await this.create(sourceTransactionData, userId);
    const destinationTransaction = await this.create(
      destinationTransactionData,
      userId,
    );

    return {
      sourceTransaction,
      destinationTransaction,
    };
  }

  async importFromCsv(
    csvBuffer: Buffer,
    userId: string,
  ): Promise<{ imported: number; errors: string[] }> {
    const csvRows: CsvRowDto[] = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from(csvBuffer);

      stream
        .pipe(csv())
        .on('data', (row: CsvRowDto) => {
          csvRows.push(row);
        })
        .on('end', () => {
          this.processCsvRows(csvRows, userId).then(resolve).catch(reject);
        })
        .on('error', (error) => {
          reject(
            new BadRequestException(`CSV parsing error: ${error.message}`),
          );
        });
    });
  }

  private async processCsvRows(
    csvRows: CsvRowDto[],
    userId: string,
  ): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];

    const userAccounts = await this.accountRepository.find({
      where: { userId },
    });

    const userCategories = await this.categoryRepository.find({
      where: [{ userId }, { isDefault: true }],
    });

    this.validateCsvData(csvRows, userAccounts, userCategories);

    // First pass: validate all rows and collect errors
    for (let i = 0; i < csvRows.length; i++) {
      try {
        const csvRow = plainToInstance(CsvRowDto, csvRows[i]);
        const validationErrors = await validate(csvRow);

        if (validationErrors.length > 0) {
          const errorMessages = validationErrors
            .map((err) => Object.values(err.constraints ?? {}))
            .flat();
          errors.push(`Row ${i + 2}: ${errorMessages.join(', ')}`);
          continue;
        }

        const account = userAccounts.find((acc) => acc.name === csvRow.Wallet);
        if (!account) {
          errors.push(`Row ${i + 2}: Account "${csvRow.Wallet}" not found`);
          continue;
        }

        const category = userCategories.find(
          (cat) => cat.name === csvRow.Category,
        );
        if (!category) {
          errors.push(`Row ${i + 2}: Category "${csvRow.Category}" not found`);
          continue;
        }

        if (account.currency !== csvRow.Currency) {
          errors.push(
            `Row ${i + 2}: Currency mismatch. Account uses ${account.currency}, transaction uses ${csvRow.Currency}`,
          );
          continue;
        }

        // Apply business rule: amount should be positive for income, negative for expense
        const expectedSign = category.type === TransactionType.INCOME ? 1 : -1;
        const actualSign = csvRow.Amount >= 0 ? 1 : -1;

        if (expectedSign !== actualSign) {
          const expectedType =
            category.type === TransactionType.INCOME ? 'positive' : 'negative';
          errors.push(
            `Row ${i + 2}: Amount should be ${expectedType} for ${category.type} transactions`,
          );
          continue;
        }
      } catch (error) {
        errors.push(
          `Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // If any errors found, return them without importing anything
    if (errors.length > 0) {
      return { imported: 0, errors };
    }

    // Second pass: import all transactions (only if no errors)
    let imported = 0;
    for (let i = 0; i < csvRows.length; i++) {
      const csvRow = plainToInstance(CsvRowDto, csvRows[i]);
      const account = userAccounts.find((acc) => acc.name === csvRow.Wallet);
      const category = userCategories.find(
        (cat) => cat.name === csvRow.Category,
      );

      // These should exist since we validated in the first pass
      if (!account || !category) {
        continue;
      }

      const transactionDto: CreateTransactionDto = {
        type: category.type,
        amount: csvRow.Amount,
        description: csvRow.Note ?? `Imported transaction`,
        categoryId: category.id,
        accountId: account.id,
        transactionDate: new Date(csvRow.Date),
      };

      await this.create(transactionDto, userId);
      imported++;
    }

    return { imported, errors };
  }

  private validateCsvData(
    csvRows: CsvRowDto[],
    userAccounts: Account[],
    userCategories: Category[],
  ): void {
    if (csvRows.length === 0) {
      throw new BadRequestException('CSV file is empty');
    }

    const requiredColumns = [
      'Date',
      'Category',
      'Amount',
      'Currency',
      'Wallet',
    ];
    const firstRow = csvRows[0];
    const missingColumns = requiredColumns.filter((col) => !(col in firstRow));

    if (missingColumns.length > 0) {
      throw new BadRequestException(
        `Missing required columns: ${missingColumns.join(', ')}`,
      );
    }

    const accountNames = new Set(csvRows.map((row) => row.Wallet));
    const categoryNames = new Set(csvRows.map((row) => row.Category));

    const userAccountNames = new Set(userAccounts.map((acc) => acc.name));
    const userCategoryNames = new Set(userCategories.map((cat) => cat.name));

    const missingAccounts = Array.from(accountNames).filter(
      (name) => !userAccountNames.has(name),
    );
    const missingCategories = Array.from(categoryNames).filter(
      (name) => !userCategoryNames.has(name),
    );

    const validationErrors: string[] = [];

    if (missingAccounts.length > 0) {
      validationErrors.push(
        `Missing accounts: ${missingAccounts.join(', ')}. Please create these accounts first.`,
      );
    }

    if (missingCategories.length > 0) {
      validationErrors.push(
        `Missing categories: ${missingCategories.join(', ')}. Please create these categories first.`,
      );
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors.join(' '));
    }
  }
}
