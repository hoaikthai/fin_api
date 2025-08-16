import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Transaction } from '../transaction/transaction.entity';
import { TransactionType } from '../common/enums';
import { BaseEntity } from '../common/base.entity';

@Entity()
export class Category extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ default: false })
  isDefault: boolean;

  @Column('uuid', { nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column('uuid', { nullable: true })
  parentId: string | null;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent, {
    onDelete: 'CASCADE',
  })
  children: Category[];

  @OneToMany(() => Transaction, (transaction) => transaction.category, {
    onDelete: 'CASCADE',
  })
  transactions: Transaction[];
}
