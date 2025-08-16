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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionService } from '../transaction/transaction.service';
import {
  TimeRangeQueryDto,
  TimePeriod,
} from '../transaction/dto/time-range-query.dto';
import type { AuthenticatedRequest } from '../common/types';

@ApiTags('Accounts')
@ApiBearerAuth('JWT-auth')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountService.create(req.user.sub, createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user accounts' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.accountService.findAllByUser(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', description: 'Account UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.accountService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiParam({ name: 'id', description: 'Account UUID', format: 'uuid' })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.update(id, req.user.sub, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  @ApiParam({ name: 'id', description: 'Account UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.accountService.remove(id, req.user.sub);
    return { message: 'Account deleted successfully' };
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get transactions for a specific account' })
  @ApiParam({ name: 'id', description: 'Account UUID', format: 'uuid' })
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
    description: 'Account transactions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getTransactions(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
    @Query() query: TimeRangeQueryDto,
  ) {
    return this.transactionService.findByAccount(
      id,
      req.user.sub,
      query.period ?? TimePeriod.MONTH,
      query.offset ?? 0,
    );
  }
}
