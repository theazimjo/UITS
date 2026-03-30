import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Group } from '../../groups/entities/group.entity';

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

  @ManyToMany(() => Group, (group) => group.students)
  groups: Group[];

  @Column({ default: true })
  isActive: boolean;
}
