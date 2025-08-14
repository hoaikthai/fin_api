import { TransactionType } from '../transaction.entity';

export class TransactionResponseDto {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  accountId: number;
  toAccountId?: number;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
