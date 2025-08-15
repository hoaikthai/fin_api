import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { TransactionType } from '../../common/enums';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsUUID()
  @IsOptional()
  toAccountId?: string;

  @IsDateString()
  @IsOptional()
  transactionDate?: Date;
}
