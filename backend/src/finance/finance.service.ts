import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { StaffPayment } from '../staff/entities/staff-payment.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Income } from '../incomes/entities/income.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(StaffPayment)
    private readonly staffPaymentRepository: Repository<StaffPayment>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
  ) {}

  private mapPaymentType(type: string): string {
    if (!type) return 'Naqd';
    const t = type.toUpperCase();
    if (t === 'CASH') return 'Naqd';
    if (t === 'CARD') return 'Karta';
    if (t === 'TRANSFER') return "O'tkazma";
    if (t === 'CLICK' || t === 'PAYME') return 'Click/Payme';
    return type; // Naqd, Karta, etc. should stay as is
  }

  async getStats(month?: string) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    
    // Helper to get totals for any month
    const getMonthTotals = async (m: string) => {
      const incs = await this.paymentRepository.find({ where: { month: m } });
      const sps = await this.staffPaymentRepository.find({ where: { month: m } });
      
      const [y, mm] = m.split('-').map(Number);
      const last = new Date(y, mm, 0).getDate();
      const s = `${m}-01`;
      const e = `${m}-${String(last).padStart(2, '0')}`;
      const ges = await this.expenseRepository.find({ where: { date: Between(s, e) } });
      const ois = await this.incomeRepository.find({ where: { date: Between(s, e) } });

      const totalInc = incs.reduce((sum, p) => sum + Number(p.amount), 0) +
                       ois.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalExp = sps.reduce((sum, p) => sum + Number(p.amount), 0) + 
                       ges.reduce((sum, p) => sum + Number(p.amount), 0);
      return { totalInc, totalExp };
    };

    // Current month detailed data
    const studentPayments = await this.paymentRepository.find({ where: { month: targetMonth } });
    const staffPayments = await this.staffPaymentRepository.find({ where: { month: targetMonth } });
    
    const [yearVal, monthVal] = targetMonth.split('-').map(Number);
    const lastDay = new Date(yearVal, monthVal, 0).getDate();
    const start = `${targetMonth}-01`;
    const end = `${targetMonth}-${String(lastDay).padStart(2, '0')}`;
    const generalExpenses = await this.expenseRepository.find({ where: { date: Between(start, end) } });
    const otherIncomes = await this.incomeRepository.find({ where: { date: Between(start, end) } });

    const totalStudentIncome = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalOtherIncome = otherIncomes.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalIncome = totalStudentIncome + totalOtherIncome;

    const totalStaffExpense = staffPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalGeneralExpense = generalExpenses.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpense = totalStaffExpense + totalGeneralExpense;
    const netProfit = totalIncome - totalExpense;

    // Breakdowns
    const incomeByMethod = {};
    const incomeByCategory = {
      "O'quv to'lovi": totalStudentIncome,
    };

    [...studentPayments, ...otherIncomes].forEach(p => {
      const m = this.mapPaymentType(p.paymentType);
      incomeByMethod[m] = (incomeByMethod[m] || 0) + Number(p.amount);
      
      // Categorize Other Incomes
      if ((p as any).category && (p as any).category !== "O'quv to'lovi") {
        incomeByCategory[(p as any).category] = (incomeByCategory[(p as any).category] || 0) + Number(p.amount);
      }
    });

    const expenseByMethod = {};
    const expenseByCategory = {};

    [...staffPayments, ...generalExpenses].forEach(p => {
      const m = this.mapPaymentType(p.paymentType);
      const c = (p as any).category || 'Xodimlar'; // Staff payments go to 'Xodimlar'
      
      expenseByMethod[m] = (expenseByMethod[m] || 0) + Number(p.amount);
      expenseByCategory[c] = (expenseByCategory[c] || 0) + Number(p.amount);
    });

    // Previous month data for MoM comparison
    const prevDate = new Date(yearVal, monthVal - 2, 1);
    const prevMonthStr = prevDate.toISOString().slice(0, 7);
    const prevMonthStats = await getMonthTotals(prevMonthStr);

    return {
      totalIncome,
      totalStudentIncome,
      totalOtherIncome,
      totalStaffExpense,
      totalGeneralExpense,
      totalExpense,
      netProfit,
      incomeByMethod,
      incomeByCategory,
      expenseByMethod,
      expenseByCategory,
      month: targetMonth,
      prevMonthStats
    };
  }

  async getTransactions(month?: string) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const [yearVal, monthNum] = targetMonth.split('-').map(Number);
    const lastDay = new Date(yearVal, monthNum, 0).getDate();
    const start = `${targetMonth}-01`;
    const end = `${targetMonth}-${String(lastDay).padStart(2, '0')}`;

    const [incomes, otherIncomes, staffExpenses, generalExpenses] = await Promise.all([
      this.paymentRepository.find({ 
        where: { month: targetMonth }, 
        order: { paymentDate: 'DESC' },
        relations: ['student'] 
      }),
      this.incomeRepository.find({
        where: { date: Between(start, end) },
        order: { date: 'DESC' }
      }),
      this.staffPaymentRepository.find({ 
        where: { month: targetMonth }, 
        order: { date: 'DESC' },
        relations: ['staff']
      }),
      this.expenseRepository.find({ 
        where: { date: Between(start, end) }, 
        order: { date: 'DESC' } 
      }),
    ]);

    const transactions = [
      ...incomes.map(item => ({
        id: `inc_${item.id}`,
        type: 'INCOME',
        title: `Talaba to'lovi: ${item.student?.name || 'Noma\'lum'}`,
        amount: Number(item.amount),
        date: item.paymentDate,
        category: 'O\'quv to\'lovi',
        paymentType: this.mapPaymentType(item.paymentType)
      })),
      ...otherIncomes.map(item => ({
        id: `oinc_${item.id}`,
        type: 'INCOME',
        title: item.title,
        amount: Number(item.amount),
        date: item.date,
        category: item.category,
        comment: item.comment,
        paymentType: this.mapPaymentType(item.paymentType)
      })),
      ...staffExpenses.map(item => ({
        id: `staff_${item.id}`,
        type: 'EXPENSE',
        title: `Maosh: ${item.staff?.name || 'Xodim'}`,
        amount: Number(item.amount),
        date: item.date,
        category: 'Xodimlar',
        comment: item.comment,
        paymentType: this.mapPaymentType(item.paymentType)
      })),
      ...generalExpenses.map(item => ({
        id: `gen_${item.id}`,
        type: 'EXPENSE',
        title: item.title,
        amount: Number(item.amount),
        date: item.date,
        category: item.category,
        comment: item.comment,
        paymentType: this.mapPaymentType(item.paymentType)
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
