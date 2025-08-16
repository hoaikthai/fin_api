import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../common/enums';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Groceries',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Transaction type this category applies to',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Parent category UUID for subcategories',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
