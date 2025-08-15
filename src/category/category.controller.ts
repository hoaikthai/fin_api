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
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';
import type { TransactionType } from '../common/enums';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.categoryService.create(createCategoryDto, req.user.sub);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest, @Query('type') type?: string) {
    if (type) {
      return this.categoryService.findAllByType(
        req.user.sub,
        type as TransactionType,
      );
    }
    return this.categoryService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.categoryService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.categoryService.update(id, updateCategoryDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.categoryService.remove(id, req.user.sub);
  }
}
