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

    let totalSalary = Number(staff.fixedAmount) || 0;
    let totalRevenue = 0;
    let totalKpi = 0;
    const groupBreakdown: any[] = [];

    // Filter groups where this staff is/was a teacher
    if (staff.groups) {
      for (const group of staff.groups) {
        // Check if this staff was teaching in this month
        let isStaffTeaching = false;
        
        if (group.phases && group.phases.length > 0) {
          isStaffTeaching = group.phases.some(p => {
            const pTeacherId = p.teacher?.id;
            if (pTeacherId !== staff.id) return false;
            
            const pStart = new Date(p.startDate);
            const pEnd = p.endDate ? new Date(p.endDate) : new Date(8640000000000000);
            return pStart <= endDate && pEnd >= startDate;
          });
        } else if (group.teacher?.id === staff.id) {
          // Fallback for groups without phases: check current teacher and group dates
          const gStart = new Date(group.startDate);
          const gEnd = group.endDate ? new Date(group.endDate) : new Date(8640000000000000);
          isStaffTeaching = gStart <= endDate && gEnd >= startDate;
        }

        if (isStaffTeaching) {
          const kpiPercentage = Number(staff.kpiPercentage) || 0;
          const coursePrice = Number(group.monthlyPrice) || 0;
          const courseDuration = Number(group.course?.duration) || 1;

          // Faqat "To'langan" (yoki oldin qoplangan) o'quvchilarni hisoblash
          const paidStudents = group.enrollments?.filter(en => {
            if (en.status !== 'ACTIVE') return false;
            
            const joinD = new Date(en.joinedDate);
            if (joinD > endDate) return false; // Hali qo'shilmagan

            // Jami to'lovlar (shu guruh uchun)
            const totalPaid = group.payments
              ?.filter(p => p.student?.id === en.student?.id)
              .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
            
            // O'qigan oylari soni (tanlangan oygacha)
            const monthsOfStudy = (year - joinD.getFullYear()) * 12 + (monthNum - 1 - joinD.getMonth()) + 1;
            const expectedMonths = Math.max(0, Math.min(monthsOfStudy, courseDuration));
            const totalExpected = expectedMonths * coursePrice;

            return totalPaid >= totalExpected;
          }).length || 0;
          
          const earnedRevenue = paidStudents * coursePrice;
          const kpiSalary = (earnedRevenue * kpiPercentage) / 100;

          if (staff.salaryType === 'KPI' || staff.salaryType === 'MIXED') {
            totalSalary += kpiSalary;
            totalKpi += kpiSalary;
          }
          totalRevenue += earnedRevenue;

          groupBreakdown.push({
            groupId: group.id,
            groupName: group.name,
            students: paidStudents,
            totalRevenue: earnedRevenue,
            kpiSalary,
            phases: (group.phases && group.phases.length > 0)
              ? group.phases.filter(p => p.teacher?.id === staff.id).map(p => ({ start: p.startDate, end: p.endDate }))
              : [{ start: group.startDate, end: group.endDate }]
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
