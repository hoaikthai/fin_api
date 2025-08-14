import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsPositive,
  IsDateString,
  IsUUID,
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

  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsUUID()
  @IsOptional()
  toAccountId?: string;

  @IsDateString()
  @IsOptional()
  transactionDate?: Date;
}
