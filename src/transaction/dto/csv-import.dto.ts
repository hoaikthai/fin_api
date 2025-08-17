import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CsvRowDto {
  @IsOptional()
  @IsString()
  Id?: string;

  @IsDateString()
  Date: string;

  @IsString()
  Category: string;

  @Type(() => Number)
  @IsNumber()
  @Transform(({ value }: { value: string | number }) => {
    if (typeof value === 'string') {
      // Remove currency symbols but preserve the sign
      const cleanValue = value.replace(/[^\d.-]/g, '');
      return parseFloat(cleanValue);
    }
    return typeof value === 'number' ? value : 0;
  })
  Amount: number;

  @IsString()
  Currency: string;

  @IsOptional()
  @IsString()
  Note?: string;

  @IsString()
  Wallet: string;
}

export class ImportTransactionsDto {
  file: Express.Multer.File;
}
