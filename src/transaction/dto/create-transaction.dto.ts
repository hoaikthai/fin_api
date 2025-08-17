import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { TransactionType } from '../../common/enums';
import { IsAmountSignValid } from '../validators/amount-sign.validator';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsAmountSignValid()
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

  @IsDateString()
  @IsOptional()
  transactionDate?: Date;
}
