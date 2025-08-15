import { TransactionType } from '../../common/enums';

export class CategoryResponseDto {
  id: string;
  name: string;
  type: TransactionType;
  isDefault: boolean;
  parentId: string | null;
  parent?: CategoryResponseDto | null;
  children?: CategoryResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
