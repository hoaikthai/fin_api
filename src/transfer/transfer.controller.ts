import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { TransactionService } from '../transaction/transaction.service';
import type { CreateTransferDto } from '../transaction/dto/create-transfer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';

@ApiTags('Transfers')
@ApiBearerAuth('JWT-auth')
@Controller('transfers')
@UseGuards(JwtAuthGuard)
export class TransferController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a transfer between accounts' })
  @ApiBody({ description: 'Transfer data' })
  @ApiResponse({ status: 201, description: 'Transfer created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createTransferDto: CreateTransferDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.transactionService.transfer(createTransferDto, req.user.sub);
  }
}
