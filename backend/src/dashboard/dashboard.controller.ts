import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('attendance-stats')
  async getAttendanceStats() {
    return this.dashboardService.getTodayAttendanceStats();
  }

  @Get('general-stats')
  async getGeneralStats() {
    return this.dashboardService.getGeneralStats();
  }
}
