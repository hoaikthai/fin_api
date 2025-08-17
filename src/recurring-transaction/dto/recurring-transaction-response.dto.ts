import { TransactionType, RecurrenceFrequency } from '../../common/enums';

export class RecurringTransactionResponseDto {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  userId: string;
  accountId: string;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate?: Date | null;
  nextDueDate?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
