import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async create(
    userId: number,
    createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    const account = this.accountRepository.create({
      ...createAccountDto,
      userId,
      balance: createAccountDto.balance || 0,
    });
    return this.accountRepository.save(account);
  }

  async findAllByUser(userId: number): Promise<Account[]> {
    return this.accountRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async update(
    id: number,
    userId: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const account = await this.findOne(id, userId);

    Object.assign(account, updateAccountDto);
    return this.accountRepository.save(account);
  }

  async remove(id: number, userId: number): Promise<void> {
    const account = await this.findOne(id, userId);
    await this.accountRepository.remove(account);
  }

  async updateBalance(
    id: number,
    userId: number,
    newBalance: number,
  ): Promise<Account> {
    const account = await this.findOne(id, userId);
    account.balance = newBalance;
    return this.accountRepository.save(account);
  }
}
