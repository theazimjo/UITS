import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity()
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Role, (role) => role.staff, { eager: true, nullable: true })
  role: Role;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: ['FIXED', 'KPI', 'MIXED'], default: 'FIXED' })
  salaryType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fixedAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  kpiPercentage: number;

  @OneToMany(() => Group, (group) => group.teacher)
  groups: Group[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ nullable: true })
  password: string;
}
