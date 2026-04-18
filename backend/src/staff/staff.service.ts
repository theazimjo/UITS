import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { Group } from '../groups/entities/group.entity';
import { StaffPayment, StaffPaymentType } from './entities/staff-payment.entity';
import { MonthlyReport } from './entities/monthly-report.entity';
import { MonthlyReportItem } from './entities/monthly-report-item.entity';
import { ReportDate } from './entities/report-date.entity';
import * as bcrypt from 'bcrypt';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(StaffPayment)
    private readonly staffPaymentRepository: Repository<StaffPayment>,
    @InjectRepository(MonthlyReport)
    private readonly monthlyReportRepo: Repository<MonthlyReport>,
    @InjectRepository(ReportDate)
    private readonly reportDateRepo: Repository<ReportDate>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async findAll(): Promise<Staff[]> {
    return this.staffRepository.find({ relations: ['role'] });
  }

  async findByUsername(username: string): Promise<Staff | null> {
    return this.staffRepository.findOne({ where: { username } });
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

    // Get payments for this staff in this month
    const payments = await this.staffPaymentRepository.find({
      where: { staff: { id }, month }
    });

    const totalPaid = payments
      .filter(p => p.type === StaffPaymentType.SALARY)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const bonusAmount = payments
      .filter(p => p.type === StaffPaymentType.BONUS)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const holidayAmount = payments
      .filter(p => p.type === StaffPaymentType.HOLIDAY)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const baseSalary = totalFixed + totalKpi;
    const remaining = baseSalary - totalPaid;

    return {
      total: baseSalary,
      revenue: totalRevenue,
      kpi: totalKpi,
      fixed: totalFixed,
      paid: totalPaid,
      remaining: remaining,
      bonus: bonusAmount,
      holiday: holidayAmount,
      payments: payments,
      breakdown: groupBreakdown,
      month,
      staffName: staff.name
    };
  }

  async addPayment(staffId: number, data: Partial<StaffPayment>): Promise<StaffPayment> {
    const staff = await this.staffRepository.findOne({ where: { id: staffId } });
    if (!staff) throw new NotFoundException('Staff not found');

    const payment = this.staffPaymentRepository.create({
      ...data,
      staff
    });
    const saved = await this.staffPaymentRepository.save(payment);
    await this.activityLogService.logAction({
      action: 'STAFF_PAYMENT',
      entityName: 'STAFF',
      entityId: staffId,
      description: `Xodimga to'lov amalga oshirildi: ${staff.name} - ${data.amount} so'm (${data.type})`,
    });
    return saved;
  }
  
  async updatePayment(paymentId: number, data: Partial<StaffPayment>): Promise<StaffPayment> {
    const payment = await this.staffPaymentRepository.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    
    Object.assign(payment, data);
    return this.staffPaymentRepository.save(payment);
  }

  async deletePayment(paymentId: number): Promise<void> {
    const payment = await this.staffPaymentRepository.findOne({ where: { id: paymentId }, relations: ['staff'] });
    if (!payment) throw new NotFoundException('Payment not found');
    const staffName = payment.staff?.name || 'Noma\'lum xodim';
    await this.staffPaymentRepository.remove(payment);
    await this.activityLogService.logAction({
      action: 'STAFF_PAYMENT_DELETE',
      entityName: 'STAFF',
      entityId: payment.staff?.id,
      description: `Xodim to'lovi o'chirildi: ${staffName} - ${payment.amount} so'm`,
    });
  }

  async create(staff: Partial<Staff>): Promise<Staff> {
    if (staff.password) {
      staff.password = await bcrypt.hash(staff.password, 10);
    }
    const saved = await this.staffRepository.save(staff);
    await this.activityLogService.logAction({
      action: 'STAFF_CREATE',
      entityName: 'STAFF',
      entityId: saved.id,
      description: `Yangi xodim qo'shildi: ${saved.name}`,
    });
    return saved;
  }

  async update(id: number, data: Partial<Staff>): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) throw new NotFoundException('Staff not found');
    
    // Merge new data and save
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    Object.assign(staff, data);
    const updated = await this.staffRepository.save(staff);
    await this.activityLogService.logAction({
      action: 'STAFF_UPDATE',
      entityName: 'STAFF',
      entityId: id,
      description: `Xodim ma'lumotlari yangilandi: ${staff.name}`,
    });
    return updated;
  }

  async remove(id: number): Promise<void> {
    const staff = await this.staffRepository.findOne({ where: { id } });
    await this.staffRepository.delete(id);
    if (staff) {
      await this.activityLogService.logAction({
        action: 'STAFF_DELETE',
        entityName: 'STAFF',
        entityId: id,
        description: `Xodim tizimdan o'chirildi: ${staff.name}`,
      });
    }
  }

  async createMonthlyReport(teacherId: number, data: {
    month: string;
    reportType: string;
    summary?: string;
    items: {
      studentId: number;
      studentName: string;
      groupName: string;
      attendanceCount: number;
      paymentStatus: string;
      examScore?: number;
      examComment?: string;
      note?: string;
    }[];
  }): Promise<MonthlyReport> {
    // Check if report already exists for this teacher/month/type
    const existing = await this.monthlyReportRepo.findOne({
      where: {
        teacherId,
        month: data.month,
        reportType: data.reportType,
      },
    });

    if (existing) {
      // Update existing report: delete old items and replace
      await this.monthlyReportRepo.manager.delete(MonthlyReportItem, { reportId: existing.id });
      existing.summary = data.summary || existing.summary;
      existing.items = data.items.map(item => {
        const ri = new MonthlyReportItem();
        Object.assign(ri, item);
        return ri;
      });
      return this.monthlyReportRepo.save(existing);
    }

    const report = this.monthlyReportRepo.create({
      teacherId,
      month: data.month,
      reportType: data.reportType,
      summary: data.summary || '',
      items: data.items.map(item => {
        const ri = new MonthlyReportItem();
        Object.assign(ri, item);
        return ri;
      }),
    });

    const saved = await this.monthlyReportRepo.save(report);
    const teacher = await this.staffRepository.findOne({ where: { id: teacherId } });
    await this.activityLogService.logAction({
      action: 'REPORT_CREATE',
      entityName: 'STAFF',
      entityId: teacherId,
      description: `Oylik hisobot topshirildi: ${teacher?.name || 'O\'qituvchi'} - ${data.month}`,
    });
    return saved;
  }

  async getMonthlyReports(teacherId: number, month?: string): Promise<MonthlyReport[]> {
    const where: any = { teacherId };
    if (month) where.month = month;

    return this.monthlyReportRepo.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['items'],
    });
  }

  async getAllMonthlyReports(month?: string): Promise<MonthlyReport[]> {
    const where: any = {};
    if (month) where.month = month;

    return this.monthlyReportRepo.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['items'],
    });
  }

  async deleteMonthlyReport(id: number, teacherId: number): Promise<void> {
    const report = await this.monthlyReportRepo.findOne({ where: { id, teacherId } });
    if (!report) throw new NotFoundException('Report not found or access denied');
    await this.monthlyReportRepo.remove(report);
  }

  // --- Report Dates (Calendar) ---
  // Report dates logic removed in favor of static periods
}
