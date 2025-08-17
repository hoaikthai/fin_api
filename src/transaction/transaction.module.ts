import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from 'src/config/configuration';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { TransactionController } from './transaction.controller';
import { Transaction } from './transaction.entity';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Account, Category]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<AppConfig>) => {
        const jwtConfig = configService.get('jwt', { infer: true })!;
        return {
          secret: jwtConfig.secret,
          signOptions: { expiresIn: jwtConfig.expiresIn },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
