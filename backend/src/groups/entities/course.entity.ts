import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Field } from './field.entity';
import { Group } from './group.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  duration: number; // Duration in months (e.g., 2)

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  monthlyPrice: number;

  @ManyToOne(() => Field, (field) => field.courses, { eager: true })
  field: Field;

  @OneToMany(() => Group, (group) => group.course)
  groups: Group[];
}
