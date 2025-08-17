import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { TransactionType } from '../common/enums';
import { BaseEntity } from '../common/base.entity';
import { RecurringTransaction } from '../recurring-transaction/recurring-transaction.entity';

@Entity()
export class Transaction extends BaseEntity {
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column('uuid')
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  accountId: string;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  transactionDate: Date;

  @Column('uuid', { nullable: true })
  relatedTransactionId?: string | null;

  @ManyToOne(() => Transaction, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'relatedTransactionId' })
  relatedTransaction?: Transaction | null;

  @Column('uuid', { nullable: true })
  recurringTransactionId?: string | null;

  @ManyToOne(() => RecurringTransaction, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recurringTransactionId' })
  recurringTransaction?: RecurringTransaction;
}
