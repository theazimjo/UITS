import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from './entities/income.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class IncomesService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  findAll() {
    return this.incomeRepository.find({ order: { date: 'DESC' } });
  }

  findOne(id: number) {
    return this.incomeRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Income>) {
    const income = this.incomeRepository.create(data);
    const saved = await this.incomeRepository.save(income);
    await this.activityLogService.logAction({
      action: 'INCOME_CREATE',
      entityName: 'INCOME',
      entityId: saved.id,
      description: `Yangi daromad qo'shildi: ${saved.category} - ${saved.amount} so'm`,
    });
    return saved;
  }

  async update(id: number, data: Partial<Income>) {
    await this.incomeRepository.update(id, data);
    const updated = await this.findOne(id);
    if (updated) {
      await this.activityLogService.logAction({
        action: 'INCOME_UPDATE',
        entityName: 'INCOME',
        entityId: id,
        description: `Daromad yangilandi: ${updated.category} - ${updated.amount} so'm`,
      });
    }
    return updated;
  }

  async remove(id: number) {
    const income = await this.findOne(id);
    await this.incomeRepository.delete(id);
    if (income) {
      await this.activityLogService.logAction({
        action: 'INCOME_DELETE',
        entityName: 'INCOME',
        entityId: id,
        description: `Daromad o'chirildi: ${income.category} - ${income.amount} so'm`,
      });
    }
    return { success: true };
  }
}
