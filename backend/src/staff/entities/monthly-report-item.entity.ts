import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MonthlyReport } from './monthly-report.entity';

@Entity()
export class MonthlyReportItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reportId: number;

  @ManyToOne(() => MonthlyReport, (report) => report.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reportId' })
  report: MonthlyReport;

  @Column()
  studentId: number;

  @Column()
  studentName: string;

  @Column()
  groupName: string;

  @Column({ type: 'varchar', length: 100, nullable: true, default: '' })
  attendanceCount: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  paymentStatus: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  examScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  currentAverage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  theoryScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  practiceScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  totalScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage: number;

  @Column({ type: 'text', nullable: true })
  examComment: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  examStatus: string; // O'tdi / O'tmadi

  @Column({ type: 'int', nullable: true })
  progressScore: number; // 1-5

  @Column({ type: 'varchar', length: 50, nullable: true })
  homeworkStatus: string; // Aktiv, Passiv, Bajarmaydi

  @Column({ type: 'text', nullable: true })
  conclusion: string; // O'zlashtirmoqda, Qiynalyapti, Kritik ...

  @Column({ type: 'text', nullable: true })
  note: string;
}
