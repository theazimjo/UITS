import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Group } from './group.entity';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.enrollments, { onDelete: 'CASCADE' })
  student: Student;

  @ManyToOne(() => Group, (group) => group.enrollments, { onDelete: 'CASCADE' })
  group: Group;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
