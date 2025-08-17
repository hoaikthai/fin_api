import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { Transaction } from '../transaction/transaction.entity';
import { TransactionType, RecurrenceFrequency } from '../common/enums';
import { BaseEntity } from '../common/base.entity';

@Entity()
export class RecurringTransaction extends BaseEntity {
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

  @Column({
    type: 'enum',
    enum: RecurrenceFrequency,
  })
  frequency: RecurrenceFrequency;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  nextDueDate?: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(
    () => Transaction,
    (transaction) => transaction.recurringTransaction,
  )
  generatedTransactions: Transaction[];
}
