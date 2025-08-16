import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TimePeriod } from './dto/time-range-query.dto';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { TransactionType } from '../common/enums';

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
      amount,
      description,
      categoryId: outgoingTransferCategory.id,
      accountId: sourceAccountId,
      transactionDate,
    };

    const destinationTransactionData: CreateTransactionDto = {
      type: TransactionType.INCOME,
      amount,
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
}
