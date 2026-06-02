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
import { Group } from '../../groups/entities/group.entity';

@Entity()
export class CertificateRequest {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column()
  teacherName: string;

  @Column()
  groupName: string;

  @Column()
  courseName: string;

  @Column({ type: 'jsonb' })
  students: { id: number; name: string }[];

  @Column({ nullable: true })
  template: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  issueDate: string; // Sana (o'qituvchi tomonidan kiritilgan)

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string; // PENDING, APPROVED, REJECTED

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
