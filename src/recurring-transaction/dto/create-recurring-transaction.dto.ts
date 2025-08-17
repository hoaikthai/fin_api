import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  IsDateString,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { TransactionType, RecurrenceFrequency } from '../../common/enums';

export class CreateRecurringTransactionDto {
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

  @IsEnum(RecurrenceFrequency)
  @IsNotEmpty()
  frequency: RecurrenceFrequency;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
