import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('activity_log')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string; // e.g., 'GROUP_TRANSFER', 'GROUP_COMPLETE', 'PAYMENT_ADDED'

  @Column()
  entityName: string; // e.g., 'GROUP', 'STUDENT', 'STAFF'

  @Column({ nullable: true })
  entityId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @CreateDateColumn()
  createdAt: Date;
}
