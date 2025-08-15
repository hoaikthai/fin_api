import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TransactionType } from '../../common/enums';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
