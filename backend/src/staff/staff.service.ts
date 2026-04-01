import { Injectable, NotFoundException } from '@nestjs/common';
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
        'groups.payments.student',
        'groups.phases'
      ] 
    });
  }

  async calculateSalary(id: number, month: string) {
    const staff = await this.findOne(id);
    if (!staff) throw new NotFoundException('Staff not found');

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    let totalSalary = Number(staff.fixedAmount) || 0;
    let totalRevenue = 0;
    let totalKpi = 0;
    const groupBreakdown: any[] = [];

    // Filter groups where this staff is/was a teacher
    if (staff.groups) {
      for (const group of staff.groups) {
        // Find phases for THIS staff in this month
        const phases = group.phases?.filter(p => {
          // If phase teacher matches this staff
          const pTeacherId = p.teacher?.id || (p as any).teacherId;
          const gTeacherId = group.teacher?.id || (group as any).teacherId;
          
          if (pTeacherId !== staff.id && gTeacherId !== staff.id) return false;
          
          const pStart = new Date(p.startDate);
          const pEnd = p.endDate ? new Date(p.endDate) : new Date(8640000000000000); // Infinity
          
          // Overlap check
          return pStart <= endDate && pEnd >= startDate;
        }) || [];

        if (phases.length > 0) {
          const activeStudents = group.enrollments?.filter(e => e.status === 'ACTIVE').length || 0;
          const coursePrice = Number(group.course?.monthlyPrice) || 0;
          const kpiPerStudent = (coursePrice * (Number(staff.kpiPercentage) || 0)) / 100;
          const kpiSalary = activeStudents * kpiPerStudent;

          if (staff.salaryType === 'KPI' || staff.salaryType === 'MIXED') {
            totalSalary += kpiSalary;
            totalKpi += kpiSalary;
          }
          totalRevenue += coursePrice * activeStudents;

          groupBreakdown.push({
            groupId: group.id,
            groupName: group.name,
            students: activeStudents,
            coursePrice,
            kpiSalary,
            phases: phases.map(p => ({ start: p.startDate, end: p.endDate }))
          });
        }
      }
    }

    return {
      staffId: staff.id,
      staffName: staff.name,
      month,
      salaryType: staff.salaryType,
      fixedAmount: Number(staff.fixedAmount),
      kpiPercentage: Number(staff.kpiPercentage),
      totalRevenue,
      totalKpi,
      totalSalary,
      groupBreakdown
    };
  }

  async create(staff: Partial<Staff>): Promise<Staff> {
    return this.staffRepository.save(staff);
  }

  async remove(id: number): Promise<void> {
    await this.staffRepository.delete(id);
  }
}
