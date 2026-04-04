import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
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
    return this.expenseRepository.save(expense);
  }

  async update(id: number, data: Partial<Expense>) {
    const expense = await this.findOne(id);
    Object.assign(expense, data);
    return this.expenseRepository.save(expense);
  }

  async remove(id: number) {
    const expense = await this.findOne(id);
    return this.expenseRepository.remove(expense);
  }
}
