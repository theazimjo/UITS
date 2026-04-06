import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Enrollment } from '../../groups/entities/enrollment.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { StudentStatus } from '../enums/student-status.enum';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ unique: true, nullable: true })
  externalId: string; // From hikvision_id

  @Column({ nullable: true })
  schoolName: string;

  @Column({ nullable: true })
  classroom: string;

  @Column({ nullable: true })
  parentName: string;

  @Column({ nullable: true })
  parentPhone: string;

  @Column({ nullable: true })
  photo: string;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[];

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.OQIYAPTI, // Default to OQIYAPTI for existing syncs
  })
  status: StudentStatus;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Payment, (payment) => payment.student)
  payments: Payment[];
}
