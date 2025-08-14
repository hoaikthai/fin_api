import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
