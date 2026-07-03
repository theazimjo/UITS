import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Staff } from './staff.entity';

@Entity()
@Unique(['staffId', 'month'])
export class StaffSalaryConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  staffId: number;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Column({ type: 'enum', enum: ['FIXED', 'KPI', 'MIXED'], default: 'FIXED' })
  salaryType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fixedAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  kpiPercentage: number;

  @Column()
  month: string; // YYYY-MM

  @CreateDateColumn()
  createdAt: Date;
}
