import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { RecurringTransaction } from './recurring-transaction.entity';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { TransactionService } from '../transaction/transaction.service';
import { RecurrenceFrequency } from '../common/enums';

@Injectable()
export class RecurringTransactionService {
  constructor(
    @InjectRepository(RecurringTransaction)
    private recurringTransactionRepository: Repository<RecurringTransaction>,
    private transactionService: TransactionService,
  ) {}

  async create(
    createRecurringTransactionDto: CreateRecurringTransactionDto,
    userId: string,
  ): Promise<RecurringTransaction> {
    const nextDueDate = this.calculateNextDueDate(
      createRecurringTransactionDto.startDate,
      createRecurringTransactionDto.frequency,
    );

    const recurringTransaction = this.recurringTransactionRepository.create({
      ...createRecurringTransactionDto,
      userId,
      nextDueDate,
      isActive: createRecurringTransactionDto.isActive ?? true,
    });

    return this.recurringTransactionRepository.save(recurringTransaction);
  }

  async findAll(userId: string): Promise<RecurringTransaction[]> {
    return this.recurringTransactionRepository.find({
      where: { userId },
      relations: ['category', 'account'],
    });
  }

  async findOne(id: string, userId: string): Promise<RecurringTransaction> {
    const recurringTransaction =
      await this.recurringTransactionRepository.findOne({
        where: { id, userId },
        relations: ['category', 'account', 'generatedTransactions'],
      });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction not found');
    }

    return recurringTransaction;
  }

  async update(
    id: string,
    updateRecurringTransactionDto: UpdateRecurringTransactionDto,
    userId: string,
  ): Promise<RecurringTransaction> {
    const recurringTransaction = await this.findOne(id, userId);

    Object.assign(recurringTransaction, updateRecurringTransactionDto);

    if (
      updateRecurringTransactionDto.frequency ||
      updateRecurringTransactionDto.startDate
    ) {
      const startDate =
        updateRecurringTransactionDto.startDate ??
        recurringTransaction.startDate;
      const frequency =
        updateRecurringTransactionDto.frequency ??
        recurringTransaction.frequency;

      recurringTransaction.nextDueDate = this.calculateNextDueDate(
        startDate,
        frequency,
      );
    }

    return this.recurringTransactionRepository.save(recurringTransaction);
  }

  async remove(id: string, userId: string): Promise<void> {
    const recurringTransaction = await this.findOne(id, userId);
    await this.recurringTransactionRepository.softRemove(recurringTransaction);
  }

  async processDueRecurringTransactions(): Promise<void> {
    const now = new Date();
    const dueRecurringTransactions =
      await this.recurringTransactionRepository.find({
        where: {
          isActive: true,
          nextDueDate: LessThanOrEqual(now),
        },
        relations: ['category', 'account'],
      });

    for (const recurringTransaction of dueRecurringTransactions) {
      if (this.shouldCreateTransaction(recurringTransaction, now)) {
        await this.createTransactionFromRecurring(recurringTransaction);
        await this.updateNextDueDate(recurringTransaction);
      }
    }
  }

  private shouldCreateTransaction(
    recurringTransaction: RecurringTransaction,
    currentDate: Date,
  ): boolean {
    if (!recurringTransaction.isActive) {
      return false;
    }

    if (
      recurringTransaction.endDate &&
      currentDate > recurringTransaction.endDate
    ) {
      return false;
    }

    return !!(
      recurringTransaction.nextDueDate &&
      currentDate >= recurringTransaction.nextDueDate
    );
  }

  private async createTransactionFromRecurring(
    recurringTransaction: RecurringTransaction,
  ): Promise<void> {
    const transactionDto = {
      type: recurringTransaction.type,
      amount: recurringTransaction.amount,
      description: `${recurringTransaction.description} (Auto-generated)`,
      categoryId: recurringTransaction.categoryId,
      accountId: recurringTransaction.accountId,
      transactionDate: new Date(),
    };

    await this.transactionService.create(
      transactionDto,
      recurringTransaction.userId,
    );
  }

  private async updateNextDueDate(
    recurringTransaction: RecurringTransaction,
  ): Promise<void> {
    const currentDueDate = recurringTransaction.nextDueDate ?? new Date();
    const nextDueDate = this.calculateNextDueDate(
      currentDueDate,
      recurringTransaction.frequency,
    );

    recurringTransaction.nextDueDate = nextDueDate;
    await this.recurringTransactionRepository.save(recurringTransaction);
  }

  private calculateNextDueDate(
    fromDate: Date,
    frequency: RecurrenceFrequency,
  ): Date {
    const nextDate = new Date(fromDate);

    switch (frequency) {
      case RecurrenceFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case RecurrenceFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case RecurrenceFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case RecurrenceFrequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }
}
