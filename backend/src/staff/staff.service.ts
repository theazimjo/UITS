import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async findAll(): Promise<Staff[]> {
    return this.staffRepository.find({ relations: ['role'] });
  }

  async findOne(id: number): Promise<Staff | null> {
    return this.staffRepository.findOne({ 
      where: { id }, 
      relations: [
        'role', 
        'groups', 
        'groups.course', 
        'groups.enrollments', 
        'groups.enrollments.student',
        'groups.payments',
        'groups.payments.student'
      ] 
    });
  }

  async create(staff: Partial<Staff>): Promise<Staff> {
    return this.staffRepository.save(staff);
  }

  async remove(id: number): Promise<void> {
    await this.staffRepository.delete(id);
  }
}
