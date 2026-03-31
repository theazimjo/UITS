import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Course } from './course.entity';
import { Room } from './room.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Enrollment } from './enrollment.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { GroupStatus } from '../enums/group-status.enum';

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

  @OneToMany(() => Enrollment, (enrollment) => enrollment.group)
  enrollments: Enrollment[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: GroupStatus,
    default: GroupStatus.WAITING,
  })
  status: GroupStatus;

  @OneToMany(() => Payment, (payment) => payment.group)
  payments: Payment[];
}
