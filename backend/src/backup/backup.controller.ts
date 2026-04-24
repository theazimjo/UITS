import { Controller, Post, UseGuards, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('backup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('trigger')
  async triggerManualBackup() {
    try {
      await this.backupService.runBackupProcess();
      return { success: true, message: 'Backup started successfully' };
    } catch (error) {
      // Agar xatolik xizmat hisobi yoki sozlamalar bilan bog'liq bo'lsa
      if (error.message.includes('topilmadi') || error.message.includes('sozlanmagan')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
