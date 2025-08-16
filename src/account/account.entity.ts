import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { BaseEntity } from '../common/base.entity';

@Entity()
export class Account extends BaseEntity {
  @Column()
  name: string;

  @Column({ length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
