import { Controller, Get, Patch, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  updateSettings(@Body() data: any) {
    return this.settingsService.updateSettings(data);
  }

  @Post('google-auth')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 1024 * 1024 }, // 1MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'application/json' && !file.originalname.endsWith('.json')) {
        return cb(new BadRequestException('Only .json files are allowed'), false);
      }
      cb(null, true);
    }
  }))
  async uploadGoogleAuth(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Fayl topilmadi');
    }
    return this.settingsService.uploadGoogleAuthFile(file);
  }
}
