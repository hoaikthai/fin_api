import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Account name',
    example: 'Checking Account',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Account currency (3-letter ISO code)',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @Length(3, 3)
  currency: string;

  @ApiProperty({
    description: 'Initial account balance',
    example: 1000.50,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @ApiProperty({
    description: 'Account description',
    example: 'My primary checking account',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
