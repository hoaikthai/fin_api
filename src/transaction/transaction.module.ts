import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction } from './transaction.entity';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Account, Category])],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
