import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class ProjectTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // 'task' | 'problem' | 'feedback'

  @Column('text')
  content: string;

  @Column()
  page: string; // path like '/dashboard'

  @Column()
  creatorName: string;

  @Column()
  creatorRole: string;

  @Column({ default: 'pending' })
  status: string; // 'pending' | 'in_progress' | 'completed'

  @Column('text', { nullable: true })
  replyMessage?: string;

  @CreateDateColumn()
  createdAt: Date;
}
