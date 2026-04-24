import { Controller, Post, UseGuards } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('google-sheets')
@UseGuards(JwtAuthGuard)
export class GoogleSheetsController {
  constructor(private readonly googleSheetsService: GoogleSheetsService) {}

  @Post('sync')
  async sync() {
    return this.googleSheetsService.syncAll();
  }
}
