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
    return this.staffRepository.find();
  }

  async create(staff: Partial<Staff>): Promise<Staff> {
    return this.staffRepository.save(staff);
  }

  async remove(id: number): Promise<void> {
    await this.staffRepository.delete(id);
  }
}
