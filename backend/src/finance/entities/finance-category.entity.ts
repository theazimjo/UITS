import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Income } from '../../incomes/entities/income.entity';
import { Expense } from '../../expenses/entities/expense.entity';

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

@Entity()
export class FinanceCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
  })
  type: CategoryType;

  @Column({ default: false })
  isSystem: boolean; // Protect "O'quv to'lovi" and "Xodimlar"

  @OneToMany(() => Income, (income) => income.financeCategory)
  incomes: Income[];

  @OneToMany(() => Expense, (expense) => expense.financeCategory)
  expenses: Expense[];
}
