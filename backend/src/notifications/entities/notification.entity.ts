import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Staff } from '../../staff/entities/staff.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  studentId?: number;

  @ManyToOne(() => Student, { nullable: true })
  student?: Student;

  @Column({ nullable: true })
  staffId?: number;

  @ManyToOne(() => Staff, { nullable: true })
  staff?: Staff;
}
