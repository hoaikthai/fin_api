import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from 'src/common/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { RecurringTransactionResponseDto } from './dto/recurring-transaction-response.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { RecurringTransaction } from './recurring-transaction.entity';
import { RecurringTransactionService } from './recurring-transaction.service';

@Controller('recurring-transactions')
@UseGuards(JwtAuthGuard)
export class RecurringTransactionController {
  constructor(
    private readonly recurringTransactionService: RecurringTransactionService,
  ) {}

  @Post()
  async create(
    @Body() createRecurringTransactionDto: CreateRecurringTransactionDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<RecurringTransactionResponseDto> {
    const recurringTransaction = await this.recurringTransactionService.create(
      createRecurringTransactionDto,
      req.user.sub,
    );

    return this.mapToResponseDto(recurringTransaction);
  }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
  ): Promise<RecurringTransactionResponseDto[]> {
    const recurringTransactions =
      await this.recurringTransactionService.findAll(req.user.sub);

    return recurringTransactions.map((rt) => this.mapToResponseDto(rt));
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<RecurringTransactionResponseDto> {
    const recurringTransaction = await this.recurringTransactionService.findOne(
      id,
      req.user.sub,
    );

    return this.mapToResponseDto(recurringTransaction);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecurringTransactionDto: UpdateRecurringTransactionDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<RecurringTransactionResponseDto> {
    const recurringTransaction = await this.recurringTransactionService.update(
      id,
      updateRecurringTransactionDto,
      req.user.sub,
    );

    return this.mapToResponseDto(recurringTransaction);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    await this.recurringTransactionService.remove(id, req.user.sub);
    return { message: 'Recurring transaction deleted successfully' };
  }

  private mapToResponseDto(
    recurringTransaction: RecurringTransaction,
  ): RecurringTransactionResponseDto {
    return {
      id: recurringTransaction.id,
      type: recurringTransaction.type,
      amount: recurringTransaction.amount,
      description: recurringTransaction.description,
      categoryId: recurringTransaction.categoryId,
      userId: recurringTransaction.userId,
      accountId: recurringTransaction.accountId,
      frequency: recurringTransaction.frequency,
      startDate: recurringTransaction.startDate,
      endDate: recurringTransaction.endDate,
      nextDueDate: recurringTransaction.nextDueDate,
      isActive: recurringTransaction.isActive,
      createdAt: recurringTransaction.createdAt,
      updatedAt: recurringTransaction.updatedAt,
    };
  }
}
