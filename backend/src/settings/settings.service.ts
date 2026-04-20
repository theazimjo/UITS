import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { BackupService } from '../backup/backup.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingsRepo: Repository<SystemSetting>,
    @Inject(forwardRef(() => BackupService))
    private readonly backupService: BackupService,
  ) {}

  async onModuleInit() {
    const exists = await this.settingsRepo.findOne({ where: { id: 1 } });
    if (!exists) {
      await this.settingsRepo.save(this.settingsRepo.create({ id: 1, googleDriveFolderIds: [] }));
    } else {
      // Migration: Ensure googleDriveFolderIds is initialized
      if (!exists.googleDriveFolderIds) {
        await this.settingsRepo.update(1, { googleDriveFolderIds: [] });
      }
    }
  }

  async getSettings() {
    return this.settingsRepo.findOne({ where: { id: 1 } });
  }

  async updateSettings(data: Partial<SystemSetting>) {
    await this.settingsRepo.update(1, data);
    const updated = await this.getSettings();
    
    // Refresh schedule if backup settings might have changed
    if ('backupHour' in data || 'autoBackupEnabled' in data) {
      await this.backupService.setupSchedule();
    }
    
    return updated;
  }

  async uploadGoogleAuthFile(file: any) {
    const configDir = path.join(process.cwd(), 'config');
    const filePath = path.join(configDir, 'google-service-account.json');

    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, file.buffer);

    return { message: 'Google Service Account muvaffaqiyatli yuklandi' };
  }
}
