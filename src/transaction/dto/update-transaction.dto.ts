import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsPositive,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { TransactionType } from '../../common/enums';

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
