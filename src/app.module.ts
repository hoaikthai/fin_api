import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { OrmConfigModule } from './ormconfig.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import { TransferModule } from './transfer/transfer.module';
import { CategoryModule } from './category/category.module';
import { RecurringTransactionModule } from './recurring-transaction/recurring-transaction.module';

@Module({
  imports: [
    ConfigModule,
    OrmConfigModule,
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    AccountModule,
    TransactionModule,
    TransferModule,
    CategoryModule,
    RecurringTransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
