import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionService } from './transaction.service';
import type { CreateTransactionDto } from './dto/create-transaction.dto';
import type { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TimeRangeQueryDto, TimePeriod } from './dto/time-range-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';

@ApiTags('Transactions')
@ApiBearerAuth('JWT-auth')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ description: 'Transaction data' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.transactionService.create(createTransactionDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user transactions' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'quarter', 'year'],
    description: 'Time period filter (defaults to month)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: 'integer',
    description:
      'Period offset (0 = current, negative = past periods, positive = future periods). Example: -1 = last period, 1 = next period',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: TimeRangeQueryDto,
  ) {
    return this.transactionService.findAll(
      req.user.sub,
      query.period ?? TimePeriod.MONTH,
      query.offset ?? 0,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction UUID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.transactionService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiParam({ name: 'id', description: 'Transaction UUID', format: 'uuid' })
  @ApiBody({ description: 'Updated transaction data' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.transactionService.update(
      id,
      updateTransactionDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiParam({ name: 'id', description: 'Transaction UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.transactionService.remove(id, req.user.sub);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import transactions from CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file with transaction data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'CSV file with columns: Id, Date, Category, Amount, Currency, Note, Wallet',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transactions imported successfully',
    schema: {
      type: 'object',
      properties: {
        imported: {
          type: 'number',
          description: 'Number of transactions imported',
        },
        errors: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of errors for failed rows',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid CSV file or data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async importTransactions(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new Error('File must be a CSV file');
    }

    return this.transactionService.importFromCsv(file.buffer, req.user.sub);
  }
}
