import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('attendance-stats')
  async getAttendanceStats(@Query('date') date: string) {
    return this.dashboardService.getTodayAttendanceStats(date);
  }

  @Get('general-stats')
  async getGeneralStats(@Query('date') date: string) {
    return this.dashboardService.getGeneralStats(date);
  }
}
