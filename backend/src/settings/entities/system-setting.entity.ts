import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  autoBackupEnabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  googleDriveFolderIds: string[];

  @Column({ nullable: true })
  lastBackupAt: Date;

  @Column({ nullable: true })
  lastBackupStatus: string; // 'SUCCESS' or 'FAILED: message'

  @Column({ default: 3 })
  backupHour: number;

  @Column({ nullable: true })
  googleSheetsId: string;
}
