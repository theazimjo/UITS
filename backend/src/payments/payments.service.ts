import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Group } from '../groups/entities/group.entity';
import { GroupPhase } from '../groups/entities/group-phase.entity';
import { LessThanOrEqual } from 'typeorm';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupPhase)
    private groupPhaseRepository: Repository<GroupPhase>,
    private activityLogService: ActivityLogService,
  ) {}

  async create(data: any) {
    const payment = this.paymentRepository.create(data) as unknown as Payment;
    
    // Auto-assign group teacher ONLY if not provided explicitly
    if (!data.teacher && data.group && data.group.id && data.month) {
      const [year, month] = data.month.split('-').map(Number);
      const monthEnd = new Date(year, month, 0).toISOString().split('T')[0];

      // Find the phase that covers the month being paid for
      const phases = await this.groupPhaseRepository.find({
        where: {
          group: { id: data.group.id },
          startDate: LessThanOrEqual(monthEnd)
        },
        order: { startDate: 'DESC' },
        relations: ['teacher']
      });

      if (phases && phases.length > 0) {
        payment.teacher = phases[0].teacher;
      } else {
        const group = await this.groupRepository.findOne({
          where: { id: data.group.id },
          relations: ['teacher']
        });
        if (group && group.teacher) {
          payment.teacher = group.teacher;
        }
      }
    } else if (!data.teacher && data.group && data.group.id) {
      const group = await this.groupRepository.findOne({
        where: { id: data.group.id },
        relations: ['teacher']
      });
      if (group && group.teacher) {
        payment.teacher = group.teacher;
      }
    }

    const saved = await this.paymentRepository.save(payment);
    const p = await this.paymentRepository.findOne({ 
      where: { id: saved.id }, 
      relations: ['student'] 
    });
    
    await this.activityLogService.logAction({
      action: 'PAYMENT_CREATE',
      entityName: 'PAYMENT',
      entityId: saved.id,
      description: `O'quvchi to'lovi qabul qilindi: ${p?.student?.name || 'Noma\'lum'} - ${saved.amount} so'm`,
    });
    return saved;
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

  async update(id: number, data: any) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) return null;
    
    // Merge new data into existing payment
    Object.assign(payment, data);
    
    // If student/group/teacher are provided as objects, handle them
    if (data.student) payment.student = data.student;
    if (data.group) payment.group = data.group;
    if (data.teacher) payment.teacher = data.teacher;

    const updated = await this.paymentRepository.save(payment);
    const p = await this.paymentRepository.findOne({ 
      where: { id: id }, 
      relations: ['student'] 
    });

    await this.activityLogService.logAction({
      action: 'PAYMENT_UPDATE',
      entityName: 'PAYMENT',
      entityId: id,
      description: `O'quvchi to'lovi yangilandi: ${p?.student?.name || 'Noma\'lum'} - ${updated.amount} so'm`,
    });
    return updated;
  }

  async remove(id: number) {
    const payment = await this.paymentRepository.findOne({ where: { id }, relations: ['student'] });
    await this.paymentRepository.delete(id);
    if (payment) {
      await this.activityLogService.logAction({
        action: 'PAYMENT_DELETE',
        entityName: 'PAYMENT',
        entityId: id,
        description: `O'quvchi to'lovi o'chirildi: ${payment.student?.name || 'Noma\'lum'} - ${payment.amount} so'm`,
      });
    }
  }
}
