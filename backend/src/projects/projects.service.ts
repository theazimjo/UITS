import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectTask } from './entities/project-task.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectTask)
    private readonly projectTaskRepo: Repository<ProjectTask>,
  ) {}

  async findAll() {
    return this.projectTaskRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: { type: string; content: string; page: string }, creatorName: string, creatorRole: string) {
    const task = this.projectTaskRepo.create({
      ...data,
      creatorName,
      creatorRole,
      status: 'pending',
    });
    return this.projectTaskRepo.save(task);
  }

  async update(id: number, updateData: { status?: string; replyMessage?: string }) {
    const task = await this.projectTaskRepo.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('Project task not found');
    }
    if (updateData.status !== undefined) {
      task.status = updateData.status;
    }
    if (updateData.replyMessage !== undefined) {
      task.replyMessage = updateData.replyMessage;
    }
    return this.projectTaskRepo.save(task);
  }
}
