import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { StaffPayment } from '../staff/entities/staff-payment.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Income } from '../incomes/entities/income.entity';
import { FinanceCategory, CategoryType } from './entities/finance-category.entity';

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
    @InjectRepository(FinanceCategory)
    private readonly categoryRepository: Repository<FinanceCategory>,
  ) { }

  async onModuleInit() {
    await this.seedSystemCategories();
    await this.migrateLegacyCategories();
  }

  private async seedSystemCategories() {
    const systems = [
      { name: "O'quv to'lovi", type: CategoryType.INCOME, isSystem: true },
      { name: "Xodimlar", type: CategoryType.EXPENSE, isSystem: true },
    ];

    for (const sys of systems) {
      const exists = await this.categoryRepository.findOne({ where: { name: sys.name, type: sys.type } });
      if (!exists) {
        await this.categoryRepository.save(this.categoryRepository.create(sys));
      } else if (!exists.isSystem) {
        exists.isSystem = true;
        await this.categoryRepository.save(exists);
      }
    }
  }

  private async migrateLegacyCategories() {
    // Migrate Incomes
    const incomes = await this.incomeRepository.find({ where: { categoryId: IsNull() } });
    for (const inc of incomes) {
      if (!inc.category) continue;
      let cat = await this.categoryRepository.findOne({ where: { name: inc.category, type: CategoryType.INCOME } });
      if (!cat) {
        cat = await this.categoryRepository.save(this.categoryRepository.create({ name: inc.category, type: CategoryType.INCOME }));
      }
      inc.categoryId = cat.id;
      await this.incomeRepository.save(inc);
    }

    // Migrate Expenses
    const expenses = await this.expenseRepository.find({ where: { categoryId: IsNull() } });
    for (const exp of expenses) {
      if (!exp.category) continue;
      let cat = await this.categoryRepository.findOne({ where: { name: exp.category, type: CategoryType.EXPENSE } });
      if (!cat) {
        cat = await this.categoryRepository.save(this.categoryRepository.create({ name: exp.category, type: CategoryType.EXPENSE }));
      }
      exp.categoryId = cat.id;
      await this.expenseRepository.save(exp);
    }
  }

  // --- Category CRUD ---
  async getCategories(type?: CategoryType) {
    const where = type ? { type } : {};
    return this.categoryRepository.find({ where, order: { name: 'ASC' } });
  }

  async createCategory(data: Partial<FinanceCategory>) {
    const cat = this.categoryRepository.create(data);
    return this.categoryRepository.save(cat);
  }

  async updateCategory(id: number, data: Partial<FinanceCategory>) {
    const cat = await this.categoryRepository.findOne({ where: { id } });
    if (!cat) return null;
    if (cat.isSystem) return cat; // Don't allow renaming system categories
    Object.assign(cat, data);
    return this.categoryRepository.save(cat);
  }

  async deleteCategory(id: number) {
    const cat = await this.categoryRepository.findOne({ where: { id } });
    if (!cat) return { success: false, message: 'Category not found' };
    if (cat.isSystem) return { success: false, message: 'System category cannot be deleted' };

    // Check if in use
    const incCount = await this.incomeRepository.count({ where: { categoryId: id } });
    const expCount = await this.expenseRepository.count({ where: { categoryId: id } });

    if (incCount > 0 || expCount > 0) {
      return { success: false, message: 'Category is in use and cannot be deleted' };
    }

    await this.categoryRepository.delete(id);
    return { success: true };
  }

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
    const generalExpenses = await this.expenseRepository.find({
      where: { date: Between(start, end) },
      relations: ['financeCategory']
    });
    const otherIncomes = await this.incomeRepository.find({
      where: { date: Between(start, end) },
      relations: ['financeCategory']
    });

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
      const catName = p instanceof Income ? (p.financeCategory?.name || p.category) : "O'quv to'lovi";
      if (catName !== "O'quv to'lovi") {
        incomeByCategory[catName] = (incomeByCategory[catName] || 0) + Number(p.amount);
      }
    });

    const expenseByMethod = {};
    const expenseByCategory = {};

    [...staffPayments, ...generalExpenses].forEach(p => {
      const m = this.mapPaymentType(p.paymentType);
      const c = p instanceof Expense ? (p.financeCategory?.name || p.category) : 'Xodimlar'; // Staff payments go to 'Xodimlar'

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
        order: { date: 'DESC' },
        relations: ['financeCategory']
      }),
      this.staffPaymentRepository.find({
        where: { month: targetMonth },
        order: { date: 'DESC' },
        relations: ['staff']
      }),
      this.expenseRepository.find({
        where: { date: Between(start, end) },
        order: { date: 'DESC' },
        relations: ['financeCategory']
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
        category: item.financeCategory?.name || item.category,
        categoryId: item.categoryId,
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
        category: item.financeCategory?.name || item.category,
        categoryId: item.categoryId,
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
