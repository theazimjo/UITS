import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Staff } from './staff.entity';
import { Student } from '../../students/entities/student.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity()
export class Exam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  teacherId: number;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher: Staff;

  @Column()
  groupId: number;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column({ type: 'varchar', length: 7 }) // YYYY-MM
  month: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  currentAverage: number; // Joriy baho (Auto-calculated average of grades)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  theoryScore: number; // Nazariy baho

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  practiceScore: number; // Amaliy baho

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalScore: number; // Umumiy

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentage: number; // Foiz

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
