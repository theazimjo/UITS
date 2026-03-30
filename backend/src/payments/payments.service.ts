import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async create(data: any) {
    const payment = this.paymentRepository.create(data);
    return this.paymentRepository.save(payment);
  }

  async findAll() {
    return this.paymentRepository.find({
      relations: ['student', 'group'],
      order: { paymentDate: 'DESC' },
    });
  }

  async findByGroup(groupId: number) {
    return this.paymentRepository.find({
      where: { group: { id: groupId } },
      order: { paymentDate: 'DESC' },
    });
  }

  async findByStudentAndGroup(studentId: number, groupId: number) {
    return this.paymentRepository.find({
      where: { 
        student: { id: studentId },
        group: { id: groupId }
      },
      order: { month: 'ASC' },
    });
  }

  async remove(id: number) {
    await this.paymentRepository.delete(id);
  }
}
