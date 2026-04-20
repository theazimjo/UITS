import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { FinanceCategory } from '../../finance/entities/finance-category.entity';

@Entity()
export class Income {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  category: string; // Grant, Sale, Gift, Investment, Other

  @Column({ default: 'Naqd' })
  paymentType: string; // Naqd, Karta, O'tkazma, Click/Payme

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => FinanceCategory, (category) => category.incomes, { nullable: true, onDelete: 'SET NULL' })
  financeCategory: FinanceCategory;

  @Column({ nullable: true })
  categoryId: number;

  @CreateDateColumn()
  createdAt: Date;
}
