import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Group } from '../groups/entities/group.entity';
import { GroupPhase } from '../groups/entities/group-phase.entity';
import { LessThanOrEqual } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupPhase)
    private groupPhaseRepository: Repository<GroupPhase>,
  ) {}

  async create(data: any) {
    const payment = this.paymentRepository.create(data) as unknown as Payment;
    
    // Auto-assign group teacher based on the month being paid for
    if (data.group && data.group.id && data.month) {
      const [year, month] = data.month.split('-').map(Number);
      const monthEnd = new Date(year, month, 0).toISOString().split('T')[0];

      // Find the phase that covers the month being paid for
      // We look for a phase that started before or during the month 
      // AND (ended after the month started OR hasn't ended yet)
      const phases = await this.groupPhaseRepository.find({
        where: {
          group: { id: data.group.id },
          startDate: LessThanOrEqual(monthEnd)
        },
        order: { startDate: 'DESC' },
        relations: ['teacher']
      });

      // Filter phases to find the one that overlaps with the month
      // The most recent phase starting before or during the month is usually the correct one
      if (phases && phases.length > 0) {
        payment.teacher = phases[0].teacher;
      } else {
        // Fallback to current group teacher if no phase history found
        const group = await this.groupRepository.findOne({
          where: { id: data.group.id },
          relations: ['teacher']
        });
        if (group && group.teacher) {
          payment.teacher = group.teacher;
        }
      }
    } else if (data.group && data.group.id) {
      // Fallback if month is missing
      const group = await this.groupRepository.findOne({
        where: { id: data.group.id },
        relations: ['teacher']
      });
      if (group && group.teacher) {
        payment.teacher = group.teacher;
      }
    }

    return this.paymentRepository.save(payment);
  }

  async findAll() {
    return this.paymentRepository.find({
      relations: ['student', 'group', 'teacher'],
      order: { paymentDate: 'DESC' },
    });
  }

  async findByGroup(groupId: number) {
    return this.paymentRepository.find({
      where: { group: { id: groupId } },
      relations: ['student', 'teacher'],
      order: { paymentDate: 'DESC' },
    });
  }

  async findByStudentAndGroup(studentId: number, groupId: number) {
    return this.paymentRepository.find({
      where: { 
        student: { id: studentId },
        group: { id: groupId }
      },
      relations: ['teacher'],
      order: { month: 'ASC' },
    });
  }

  async findByStudent(studentId: number) {
    return this.paymentRepository.find({
      where: { student: { id: studentId } },
      relations: ['group', 'teacher'],
      order: { paymentDate: 'DESC' },
    });
  }

  async remove(id: number) {
    await this.paymentRepository.delete(id);
  }
}
