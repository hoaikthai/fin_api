import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { TransactionType } from '../../common/enums';
import { IsAmountSignValid } from '../validators/amount-sign.validator';

export class UpdateTransactionDto {
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsAmountSignValid()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsDateString()
  @IsOptional()
  transactionDate?: Date;
}
