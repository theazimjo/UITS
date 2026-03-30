import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Course } from './course.entity';
import { Room } from './room.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Student } from '../../students/entities/student.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('simple-array')
  days: string[];

  @Column()
  startTime: string; // HH:mm

  @Column()
  endTime: string; // HH:mm

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  monthlyPrice: number;

  @ManyToOne(() => Course, (course) => course.groups, { eager: true })
  course: Course;

  @ManyToOne(() => Room, (room) => room.groups, { eager: true })
  room: Room;

  @ManyToOne(() => Staff, { eager: true })
  teacher: Staff;

  @ManyToMany(() => Student, (student) => student.groups)
  @JoinTable()
  students: Student[];

  @Column({ default: true })
  isActive: boolean;
}
