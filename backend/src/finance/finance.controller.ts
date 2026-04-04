import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
}
