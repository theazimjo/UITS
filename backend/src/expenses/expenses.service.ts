import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async findAll() {
    return this.expenseRepository.find({ order: { date: 'DESC' } });
  }

  async findOne(id: number) {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async create(data: Partial<Expense>) {
    const expense = this.expenseRepository.create(data);
    const saved = await this.expenseRepository.save(expense);
    await this.activityLogService.logAction({
      action: 'EXPENSE_CREATE',
      entityName: 'EXPENSE',
      entityId: saved.id,
      description: `Yangi xarajat qo'shildi: ${saved.category} - ${saved.amount} so'm`,
    });
    return saved;
  }

  async update(id: number, data: Partial<Expense>) {
    const expense = await this.findOne(id);
    Object.assign(expense, data);
    const updated = await this.expenseRepository.save(expense);
    await this.activityLogService.logAction({
      action: 'EXPENSE_UPDATE',
      entityName: 'EXPENSE',
      entityId: id,
      description: `Xarajat yangilandi: ${updated.category} - ${updated.amount} so'm`,
    });
    return updated;
  }

  async remove(id: number) {
    const expense = await this.findOne(id);
    await this.expenseRepository.remove(expense);
    await this.activityLogService.logAction({
      action: 'EXPENSE_DELETE',
      entityName: 'EXPENSE',
      entityId: id,
      description: `Xarajat o'chirildi: ${expense.category} - ${expense.amount} so'm`,
    });
    return { success: true };
  }
}
