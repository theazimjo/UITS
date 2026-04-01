import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly logRepo: Repository<ActivityLog>,
  ) {}

  async logAction(data: {
    action: string;
    entityName: string;
    entityId?: number;
    description?: string;
    details?: any;
  }) {
    const log = this.logRepo.create(data);
    return this.logRepo.save(log);
  }

  async findAll(query?: any) {
    return this.logRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
      ...query
    });
  }

  async findByEntity(entityName: string, entityId: number) {
    return this.logRepo.find({
      where: { entityName, entityId },
      order: { createdAt: 'DESC' }
    });
  }
}
