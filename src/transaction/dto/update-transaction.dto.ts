import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { TransactionType } from '../transaction.entity';

export class UpdateTransactionDto {
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  accountId?: number;

  @IsNumber()
  @IsOptional()
  toAccountId?: number;

  @IsDateString()
  @IsOptional()
  transactionDate?: Date;
}
