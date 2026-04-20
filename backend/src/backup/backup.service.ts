import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
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

  constructor(private readonly settingsService: SettingsService) {}

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
      if (!settings?.googleDriveFolderId) {
        throw new Error('Google Drive Folder ID not configured');
      }

      if (!fs.existsSync(this.SERVICE_ACCOUNT_PATH)) {
        throw new Error('Google Service Account JSON file not found at /config/google-service-account.json');
      }

      // 1. Create SQL Dump
      const fileName = `uits_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      filePath = path.join('/tmp', fileName);
      
      const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
      
      this.logger.log(`Creating database dump: ${fileName}`);
      await execPromise(`pg_dump "${dbUrl}" > ${filePath}`);

      // 2. Upload to Google Drive
      this.logger.log('Uploading to Google Drive...');
      await this.uploadFileToDrive(filePath, fileName, settings.googleDriveFolderId);

      // 3. Update Status
      await this.settingsService.updateSettings({
        lastBackupAt: new Date(),
        lastBackupStatus: 'SUCCESS',
      });
      this.logger.log('Backup process completed successfully');

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
