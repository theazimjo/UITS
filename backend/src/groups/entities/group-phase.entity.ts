import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Group } from './group.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Course } from './course.entity';

@Entity()
export class GroupPhase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, (group) => group.phases, { onDelete: 'CASCADE' })
  group: Group;

  @ManyToOne(() => Staff, { eager: true })
  teacher: Staff;

  @ManyToOne(() => Course, { eager: true })
  course: Course;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;
}
