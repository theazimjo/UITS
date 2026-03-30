import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ nullable: true })
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

  @Column({ default: true })
  isActive: boolean;
}
