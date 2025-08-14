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
  ParseIntPipe,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountService.create(req.user.sub, createAccountDto);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.accountService.findAllByUser(req.user.sub);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.accountService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.update(id, req.user.sub, updateAccountDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.accountService.remove(id, req.user.sub);
    return { message: 'Account deleted successfully' };
  }
}
