import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { Group } from '../groups/entities/group.entity';

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
    const staff = await this.staffRepository.findOne({ 
      where: { id }, 
      relations: ['role'] 
    });

    if (!staff) return null;

    // Fetch all groups where staff is current teacher OR was a teacher in the past (phases)
    const groups = await this.staffRepository.manager.find(Group, {
      where: [
        { teacher: { id } },
        { phases: { teacher: { id } } }
      ],
      relations: [
        'course', 
        'enrollments', 
        'enrollments.student',
        'payments',
        'payments.student',
        'payments.teacher',
        'phases',
        'phases.teacher'
      ]
    });

    staff.groups = groups;
    return staff;
  }

  async calculateSalary(id: number, month: string) {
    const staff = await this.findOne(id);
    if (!staff) throw new NotFoundException('Staff not found');

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    let totalFixed = (staff.salaryType === 'FIXED' || staff.salaryType === 'MIXED')
      ? Number(staff.fixedAmount || 0)
      : 0;
    
    let totalRevenue = 0;
    let totalKpi = 0;
    const groupBreakdown: any[] = [];

    if (staff.groups) {
      // Ensure unique groups (TypeORM OR query might return duplicates)
      const uniqueGroups = Array.from(new Map(staff.groups.map(g => [g.id, g])).values());

      for (const group of uniqueGroups) {
        // Calculate Revenue from payments MADE BY THIS TEACHER THIS MONTH for THIS GROUP
        const groupRevenue = group.payments
          ?.filter(p => p.month === month && p.teacher?.id === id)
          ?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

        // Check if this staff was teaching in this month (Phases)
        const isStaffTeaching = group.phases?.some(p => {
          if (p.teacher?.id !== staff.id) return false;
          const pStart = new Date(p.startDate);
          const pEnd = p.endDate ? new Date(p.endDate) : new Date(8640000000000000);
          return pStart <= endDate && pEnd >= startDate;
        }) || (group.teacher?.id === staff.id && (new Date(group.startDate) <= endDate));

        if (groupRevenue > 0 || isStaffTeaching) {
          const kpiPercentage = Number(staff.kpiPercentage) || 0;
          const groupKpi = (groupRevenue * kpiPercentage) / 100;

          if (staff.salaryType === 'KPI' || staff.salaryType === 'MIXED') {
            totalKpi += groupKpi;
          }
          totalRevenue += groupRevenue;

          groupBreakdown.push({
            id: group.id,
            name: group.name,
            revenue: groupRevenue,
            kpi: groupKpi,
            studentCount: group.enrollments?.filter(en => en.status === 'ACTIVE').length || 0
          });
        }
      }
    }

    return {
      total: totalFixed + totalKpi,
      revenue: totalRevenue,
      kpi: totalKpi,
      fixed: totalFixed,
      breakdown: groupBreakdown,
      month,
      staffName: staff.name
    };
  }

  async create(staff: Partial<Staff>): Promise<Staff> {
    return this.staffRepository.save(staff);
  }

  async update(id: number, data: Partial<Staff>): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) throw new NotFoundException('Staff not found');
    
    // Merge new data and save
    Object.assign(staff, data);
    return this.staffRepository.save(staff);
  }

  async remove(id: number): Promise<void> {
    await this.staffRepository.delete(id);
  }
}
