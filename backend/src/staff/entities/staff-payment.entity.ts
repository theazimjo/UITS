import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Staff } from './staff.entity';

export enum StaffPaymentType {
  SALARY = 'SALARY',
  BONUS = 'BONUS',
  HOLIDAY = 'HOLIDAY'
}

@Entity()
export class StaffPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  month: string; // YYYY-MM

  @Column({
    type: 'enum',
    enum: StaffPaymentType,
    default: StaffPaymentType.SALARY
  })
  type: StaffPaymentType;

  @Column({ type: 'date' })
  date: string;

  @Column({ default: 'Naqd' })
  paymentType: string; // Naqd, Karta, O'tkazma, Click/Payme

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  staff: Staff;

  @CreateDateColumn()
  createdAt: Date;
}
