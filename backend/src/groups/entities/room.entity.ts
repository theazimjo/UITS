import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  capacity: number;

  @OneToMany(() => Group, (group) => group.room)
  groups: Group[];
}
