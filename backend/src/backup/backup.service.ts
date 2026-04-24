import { Injectable, OnModuleInit, Logger, Inject, forwardRef } from '@nestjs/common';
import * as cron from 'node-cron';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { SettingsService } from '../settings/settings.service';

const execPromise = promisify(exec);

@Injectable()
export class BackupService implements OnModuleInit {
  private readonly logger = new Logger(BackupService.name);
  private readonly SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'config', 'google-service-account.json');

  private backupTask: cron.ScheduledTask;

  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settingsService: SettingsService,
  ) { }

  async onModuleInit() {
    await this.setupSchedule();
  }

  async setupSchedule() {
    if (this.backupTask) {
      this.backupTask.stop();
    }

    const settings = await this.settingsService.getSettings();
    const hour = settings?.backupHour ?? 3;

    this.backupTask = cron.schedule(`0 ${hour} * * *`, () => {
      this.handleScheduledBackup();
    });

    this.logger.log(`Backup scheduler initialized (Daily at ${hour}:00)`);
  }

  async handleScheduledBackup() {
    const settings = await this.settingsService.getSettings();
    if (settings?.autoBackupEnabled) {
      this.logger.log('Starting automated daily backup...');
      await this.runBackupProcess();
    }
  }

  async runBackupProcess() {
    let filePath = '';
    try {
      const settings = await this.settingsService.getSettings();
      const folderIds = settings?.googleDriveFolderIds || [];

      if (folderIds.length === 0) {
        throw new Error('Google Drive Folder ID(lar)i sozlanmagan');
      }

      if (!fs.existsSync(this.SERVICE_ACCOUNT_PATH)) {
        throw new Error('Google Service Account JSON fayli topilmadi (/config/google-service-account.json)');
      }

      // 1. Create SQL Dump
      const fileName = `uits_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      filePath = path.join('/tmp', fileName);

      const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
      
      this.logger.log(`Creating database dump: ${fileName}`);
      
      // Use PGPASSWORD env var for security and to handle special characters
      const command = `PGPASSWORD="${DB_PASSWORD}" pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} ${DB_NAME} > ${filePath}`;
      await execPromise(command);

      // 2. Upload to all Google Drive folders
      this.logger.log(`Uploading to ${folderIds.length} Google Drive folders...`);
      const errors: string[] = [];

      for (const folderId of folderIds) {
        try {
          this.logger.log(`Uploading to folder: ${folderId}`);
          await this.uploadFileToDrive(filePath, fileName, folderId);
        } catch (uploadError) {
          this.logger.error(`Failed to upload to folder ${folderId}: ${uploadError.message}`);
          errors.push(`${folderId}: ${uploadError.message}`);
        }
      }

      if (errors.length > 0) {
        throw new Error(`Ba'zi jildlarga yuklashda xatolik: ${errors.join(', ')}`);
      }

      // 3. Update Status
      await this.settingsService.updateSettings({
        lastBackupAt: new Date(),
        lastBackupStatus: 'SUCCESS',
      });
      this.logger.log('Backup process completed successfully for all destinations');

    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`);
      await this.settingsService.updateSettings({
        lastBackupAt: new Date(),
        lastBackupStatus: `FAILED: ${error.message}`,
      });
      throw error;
    } finally {
      // Clean up
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  private async uploadFileToDrive(filePath: string, fileName: string, folderId: string) {
    const auth = new google.auth.GoogleAuth({
      keyFile: this.SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: 'application/octet-stream',
      body: fs.createReadStream(filePath),
    };

    await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    } as any);
  }
}
