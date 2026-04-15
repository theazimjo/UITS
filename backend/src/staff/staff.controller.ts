import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { StaffService } from './staff.service';
import { Staff } from './entities/staff.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  findAll(): Promise<Staff[]> {
    return this.staffService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Staff | null> {
    if (isNaN(+id)) return null;
    return this.staffService.findOne(+id);
  }

  @Get(':id/salary')
  calculateSalary(@Param('id') id: string, @Query('month') month: string) {
    return this.staffService.calculateSalary(+id, month);
  }

  @Post(':id/payments')
  addPayment(@Param('id') id: string, @Body() data: any) {
    return this.staffService.addPayment(+id, data);
  }

  @Roles('admin')
  @Post()
  create(@Body() staff: Partial<Staff>): Promise<Staff> {
    return this.staffService.create(staff);
  }

  @Roles('admin')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Staff>): Promise<Staff> {
    if (isNaN(+id)) throw new NotFoundException('Invalid ID');
    return this.staffService.update(+id, data);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    if (isNaN(+id)) return Promise.resolve();
    return this.staffService.remove(+id);
  }

  @Post(':id/monthly-report')
  createMonthlyReport(@Param('id') id: string, @Body() data: any) {
    if (isNaN(+id)) throw new NotFoundException('Invalid ID');
    return this.staffService.createMonthlyReport(+id, data);
  }

  @Get(':id/monthly-reports')
  getMonthlyReports(@Param('id') id: string, @Query('month') month?: string) {
    if (isNaN(+id)) throw new NotFoundException('Invalid ID');
    return this.staffService.getMonthlyReports(+id, month);
  }
}
