import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurringTransactionService } from './recurring-transaction.service';

@Injectable()
export class RecurringTransactionSchedulerService {
  private readonly logger = new Logger(
    RecurringTransactionSchedulerService.name,
  );

  constructor(
    private readonly recurringTransactionService: RecurringTransactionService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurringTransactions() {
    this.logger.log('Processing recurring transactions...');

    try {
      await this.recurringTransactionService.processDueRecurringTransactions();
      this.logger.log('Successfully processed recurring transactions');
    } catch (error) {
      this.logger.error('Failed to process recurring transactions', error);
    }
  }
}
