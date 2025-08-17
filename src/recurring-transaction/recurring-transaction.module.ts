import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from 'src/config/configuration';
import { TransactionModule } from '../transaction/transaction.module';
import { RecurringTransactionSchedulerService } from './recurring-transaction-scheduler.service';
import { RecurringTransactionController } from './recurring-transaction.controller';
import { RecurringTransaction } from './recurring-transaction.entity';
import { RecurringTransactionService } from './recurring-transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecurringTransaction]),
    TransactionModule,
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
  controllers: [RecurringTransactionController],
  providers: [
    RecurringTransactionService,
    RecurringTransactionSchedulerService,
  ],
  exports: [RecurringTransactionService],
})
export class RecurringTransactionModule {}
