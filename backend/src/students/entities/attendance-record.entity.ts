import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { Student } from './student.entity';

@Entity()
@Index(['externalId', 'date'], { unique: true })
export class AttendanceRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  externalId: string;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD format

  @Column()
  status: string; // 'present' | 'absent'

  @Column({ nullable: true })
  arrivedAt: string;

  @Column({ nullable: true })
  leftAt: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
