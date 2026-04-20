import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('stats')
  @Roles('admin')
  getStats(@Query('month') month: string) {
    return this.financeService.getStats(month);
  }

  @Get('transactions')
  @Roles('admin')
  getTransactions(@Query('month') month: string) {
    return this.financeService.getTransactions(month);
  }

  @Get('chart')
  @Roles('admin')
  getChartData() {
    return this.financeService.getChartData();
  }

  // --- Category Endpoints ---
  @Get('categories')
  @Roles('admin')
  getCategories(@Query('type') type: string) {
    return this.financeService.getCategories(type as any);
  }

  @Post('categories')
  @Roles('admin')
  createCategory(@Body() data: any) {
    return this.financeService.createCategory(data);
  }

  @Patch('categories/:id')
  @Roles('admin')
  updateCategory(@Param('id') id: number, @Body() data: any) {
    return this.financeService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @Roles('admin')
  deleteCategory(@Param('id') id: number) {
    return this.financeService.deleteCategory(id);
  }
}
