import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DataService } from './data.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportData() {
    return this.dataService.exportAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('import')
  async importData(@Body() data: any) {
    return this.dataService.importData(data);
  }
}
