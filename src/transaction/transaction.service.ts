import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
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

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    const { accountId, toAccountId, type, categoryId } = createTransactionDto;

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

    if (type === TransactionType.TRANSFER) {
      if (!toAccountId) {
        throw new BadRequestException(
          'Transfer transactions require a destination account',
        );
      }

      const toAccount = await this.accountRepository.findOne({
        where: { id: toAccountId, userId },
      });

      if (!toAccount) {
        throw new NotFoundException('Destination account not found');
      }

      if (accountId === toAccountId) {
        throw new BadRequestException('Cannot transfer to the same account');
      }
    }

    if (type !== TransactionType.TRANSFER && toAccountId) {
      throw new BadRequestException(
        'Only transfer transactions can have a destination account',
      );
    }

    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      userId,
      transactionDate: createTransactionDto.transactionDate ?? new Date(),
    });

    return this.transactionRepository.save(transaction);
  }

  async findAll(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId },
      relations: ['account', 'toAccount', 'category'],
      order: { transactionDate: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['account', 'toAccount', 'category'],
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

    if (updateTransactionDto.toAccountId) {
      const toAccount = await this.accountRepository.findOne({
        where: { id: updateTransactionDto.toAccountId, userId },
      });

      if (!toAccount) {
        throw new NotFoundException('Destination account not found');
      }

      if (updateTransactionDto.accountId === updateTransactionDto.toAccountId) {
        throw new BadRequestException('Cannot transfer to the same account');
      }
    }

    const updatedType = updateTransactionDto.type ?? transaction.type;
    if (
      updatedType === TransactionType.TRANSFER &&
      !updateTransactionDto.toAccountId &&
      !transaction.toAccountId
    ) {
      throw new BadRequestException(
        'Transfer transactions require a destination account',
      );
    }

    if (
      updatedType !== TransactionType.TRANSFER &&
      updateTransactionDto.toAccountId
    ) {
      throw new BadRequestException(
        'Only transfer transactions can have a destination account',
      );
    }

    Object.assign(transaction, updateTransactionDto);
    return this.transactionRepository.save(transaction);
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findOne(id, userId);
    await this.transactionRepository.remove(transaction);
  }

  async findByAccount(
    accountId: string,
    userId: string,
  ): Promise<Transaction[]> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return this.transactionRepository.find({
      where: [
        { accountId, userId },
        { toAccountId: accountId, userId },
      ],
      relations: ['account', 'toAccount', 'category'],
      order: { transactionDate: 'DESC' },
    });
  }
}
