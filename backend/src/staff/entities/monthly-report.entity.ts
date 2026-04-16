import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Staff } from './staff.entity';
import { MonthlyReportItem } from './monthly-report-item.entity';

@Entity()
@Index(['teacherId', 'month', 'reportType'])
export class MonthlyReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teacherId: number;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher: Staff;

  @Column({ type: 'varchar', length: 7 }) // YYYY-MM
  month: string;

  @Column({
    type: 'enum',
    enum: ['10_DAY', '20_DAY', 'EXAM'],
  })
  reportType: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @OneToMany(() => MonthlyReportItem, (item) => item.report, {
    cascade: true,
    eager: true,
  })
  items: MonthlyReportItem[];

  @CreateDateColumn()
  createdAt: Date;
}
