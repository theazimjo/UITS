import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Staff } from './staff.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Staff, (staff) => staff.role)
  staff: Staff[];
}
