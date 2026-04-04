import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Course } from './course.entity';

@Entity()
export class GroupPhase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, (group) => group.phases, { onDelete: 'CASCADE' })
  group: Group;

  @Column({ nullable: true })
  teacherId: number;

  @ManyToOne(() => Staff, { eager: true })
  @JoinColumn({ name: 'teacherId' })
  teacher: Staff;

  @Column({ nullable: true })
  courseId: number;

  @ManyToOne(() => Course, { eager: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;
}
