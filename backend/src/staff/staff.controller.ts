import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch, NotFoundException } from '@nestjs/common';
import { StaffService } from './staff.service';
import { Staff } from './entities/staff.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('staff')
@UseGuards(JwtAuthGuard)
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

  @Get(':id/salary/:month')
  async getSalary(@Param('id') id: string, @Param('month') month: string) {
    if (isNaN(+id)) return null;
    return this.staffService.calculateSalary(+id, month);
  }

  @Post()
  create(@Body() staff: Partial<Staff>): Promise<Staff> {
    return this.staffService.create(staff);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Staff>): Promise<Staff> {
    if (isNaN(+id)) throw new NotFoundException('Invalid ID');
    return this.staffService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    if (isNaN(+id)) return Promise.resolve();
    return this.staffService.remove(+id);
  }
}
