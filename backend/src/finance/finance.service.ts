import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { StaffPayment } from '../staff/entities/staff-payment.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(StaffPayment)
    private readonly staffPaymentRepository: Repository<StaffPayment>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async getStats(month?: string) {
    // If month is not provided, use current month
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    // Sum Incomes
    const incomes = await this.paymentRepository.find({
      where: { month: targetMonth }
    });
    const totalIncome = incomes.reduce((sum, p) => sum + Number(p.amount), 0);

    // Sum Staff Expenses
    const staffPayments = await this.staffPaymentRepository.find({
      where: { month: targetMonth }
    });
    const totalStaffExpense = staffPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Sum General Expenses
    // For general expenses, we filter by date range of the month
    const [yearVal, monthVal] = targetMonth.split('-').map(Number);
    const lastDay = new Date(yearVal, monthVal, 0).getDate();
    const start = `${targetMonth}-01`;
    const end = `${targetMonth}-${String(lastDay).padStart(2, '0')}`;
    
    const generalExpenses = await this.expenseRepository.find({
      where: { date: Between(start, end) }
    });
    const totalGeneralExpense = generalExpenses.reduce((sum, p) => sum + Number(p.amount), 0);

    const totalExpense = totalStaffExpense + totalGeneralExpense;
    const netProfit = totalIncome - totalExpense;

    return {
      totalIncome,
      totalStaffExpense,
      totalGeneralExpense,
      totalExpense,
      netProfit,
      month: targetMonth
    };
  }

  async getTransactions(month?: string) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const [yearVal, monthNum] = targetMonth.split('-').map(Number);
    const lastDay = new Date(yearVal, monthNum, 0).getDate();
    const start = `${targetMonth}-01`;
    const end = `${targetMonth}-${String(lastDay).padStart(2, '0')}`;

    const [incomes, staffExpenses, generalExpenses] = await Promise.all([
      this.paymentRepository.find({ where: { month: targetMonth }, order: { paymentDate: 'DESC' } }),
      this.staffPaymentRepository.find({ where: { month: targetMonth }, order: { date: 'DESC' } }),
      this.expenseRepository.find({ where: { date: Between(start, end) }, order: { date: 'DESC' } }),
    ]);

    // Format all into a unified type
    const transactions = [
      ...incomes.map(item => ({
        id: `inc_${item.id}`,
        type: 'INCOME',
        title: `Talaba to'lovi: ${item.student?.name || 'Noma\'lum'}`,
        amount: Number(item.amount),
        date: item.paymentDate,
        category: 'O\'quv to\'lovi',
        comment: item.paymentType
      })),
      ...staffExpenses.map(item => ({
        id: `staff_${item.id}`,
        type: 'EXPENSE',
        title: `Maosh: ${item.staff?.name || 'Xodim'}`,
        amount: Number(item.amount),
        date: item.date,
        category: 'Xodimlar',
        comment: item.comment
      })),
      ...generalExpenses.map(item => ({
        id: `gen_${item.id}`,
        type: 'EXPENSE',
        title: item.title,
        amount: Number(item.amount),
        date: item.date,
        category: item.category,
        comment: item.comment
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return transactions;
  }

  async getChartData() {
    // Get last 6 months trends
    const results: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.toISOString().slice(0, 7);
      const stats = await this.getStats(m);
      results.push({
        month: m,
        income: stats.totalIncome,
        expense: stats.totalExpense,
        profit: stats.netProfit
      });
    }
    return results;
  }
}
