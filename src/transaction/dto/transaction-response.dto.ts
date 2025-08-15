import { TransactionType } from '../../common/enums';
import { CategoryResponseDto } from '../../category/dto/category-response.dto';

export class TransactionResponseDto {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  category?: CategoryResponseDto;
  accountId: string;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
