import { Entity, Column, OneToMany } from 'typeorm';
import { Account } from '../account/account.entity';
import { BaseEntity } from '../common/base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];
}
