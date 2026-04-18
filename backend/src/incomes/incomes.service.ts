import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from './entities/income.entity';

@Injectable()
export class IncomesService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
  ) {}

  findAll() {
    return this.incomeRepository.find({ order: { date: 'DESC' } });
  }

  findOne(id: number) {
    return this.incomeRepository.findOne({ where: { id } });
  }

  create(data: Partial<Income>) {
    const income = this.incomeRepository.create(data);
    return this.incomeRepository.save(income);
  }

  async update(id: number, data: Partial<Income>) {
    await this.incomeRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.incomeRepository.delete(id);
    return { success: true };
  }
}
