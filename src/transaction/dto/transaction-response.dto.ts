import { TransactionType } from '../transaction.entity';

export class TransactionResponseDto {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  accountId: string;
  toAccountId?: string;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
