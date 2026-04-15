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

  @Column({ type: 'int', default: 0 })
  attendanceCount: number;

  @Column({ type: 'varchar', length: 50, default: '' })
  paymentStatus: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  examScore: number;

  @Column({ type: 'text', nullable: true })
  examComment: string;

  @Column({ type: 'text', nullable: true })
  note: string;
}
