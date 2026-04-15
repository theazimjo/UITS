import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class ReportDate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', unique: true })
  date: string; // Stored as YYYY-MM-DD

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
