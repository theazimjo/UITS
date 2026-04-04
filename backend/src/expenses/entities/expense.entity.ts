import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  category: string; // Rent, Utility, Marketing, Equipment, Other

  @Column({ default: 'Naqd' })
  paymentType: string; // Naqd, Karta, O'tkazma, Click/Payme

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
