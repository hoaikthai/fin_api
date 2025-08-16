import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { Account } from './account.entity';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_jwt_secret',
      signOptions: { expiresIn: '1h' },
    }),
    TransactionModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
