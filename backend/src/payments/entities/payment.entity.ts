import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Group } from '../../groups/entities/group.entity';
import { Staff } from '../../staff/entities/staff.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, { eager: true })
  student: Student;

  @ManyToOne(() => Group, { eager: true, onDelete: 'CASCADE' })
  group: Group;

  @ManyToOne(() => Staff, { eager: true, nullable: true })
  teacher: Staff;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  month: string; // YYYY-MM

  @Column({ type: 'date' })
  paymentDate: string;

  @Column({ nullable: true })
  paymentType: string; // CASH, CARD, etc.

  @Column({ default: 'PAID' })
  status: string; // PAID, PARTIAL, etc.

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penalty: number;

  @Column({ nullable: true })
  collectedBy: string;
}
