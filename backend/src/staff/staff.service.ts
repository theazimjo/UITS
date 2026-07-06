import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { Group } from '../groups/entities/group.entity';
import { StaffPayment, StaffPaymentType } from './entities/staff-payment.entity';
import { MonthlyReport } from './entities/monthly-report.entity';
import { MonthlyReportItem } from './entities/monthly-report-item.entity';
import { ReportDate } from './entities/report-date.entity';
import { CertificateRequest } from './entities/certificate-request.entity';
import { StaffSalaryConfig } from './entities/staff-salary-config.entity';
import * as bcrypt from 'bcrypt';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationsService } from '../notifications/notifications.service';

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
    @InjectRepository(CertificateRequest)
    private readonly certificateRequestRepo: Repository<CertificateRequest>,
    @InjectRepository(StaffSalaryConfig)
    private readonly staffSalaryConfigRepo: Repository<StaffSalaryConfig>,
    private readonly activityLogService: ActivityLogService,
    private readonly notificationsService: NotificationsService,
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

    // Find active salary configuration for this month
    const configs = await this.staffSalaryConfigRepo.find({
      where: { staffId: id },
      order: { month: 'ASC' }
    });

    let activeConfig: StaffSalaryConfig | null = null;
    for (const config of configs) {
      if (config.month <= month) {
        activeConfig = config;
      } else {
        break;
      }
    }

    const effectiveSalaryType = activeConfig ? activeConfig.salaryType : staff.salaryType;
    const effectiveFixedAmount = activeConfig ? activeConfig.fixedAmount : staff.fixedAmount;
    const effectiveKpiPercentage = activeConfig ? activeConfig.kpiPercentage : staff.kpiPercentage;

    let totalFixed = (effectiveSalaryType === 'FIXED' || effectiveSalaryType === 'MIXED')
      ? Number(effectiveFixedAmount || 0)
      : 0;
    
    let totalRevenue = 0;
    let totalKpi = 0;
    const groupBreakdown: any[] = [];

    if (staff.groups) {
      // Ensure unique groups (TypeORM OR query might return duplicates)
      const uniqueGroups = Array.from(new Map(staff.groups.map(g => [g.id, g])).values());

      for (const group of uniqueGroups) {
        // Check if this staff was teaching in this month (via phases or current assignment)
        const isStaffTeaching = group.phases?.some(p => {
          if (p.teacher?.id !== staff.id) return false;
          const pStart = new Date(p.startDate);
          const pEnd = p.endDate ? new Date(p.endDate) : new Date(8640000000000000);
          return pStart <= endDate && pEnd >= startDate;
        }) || (group.teacher?.id === staff.id && (new Date(group.startDate) <= endDate));

        // Skip groups where this teacher was NOT teaching during the selected month
        if (!isStaffTeaching) continue;

        // Count ALL payments for this group in this month (regardless of payment.teacher field)
        // This matches the logic in /teacher/my-finance endpoint for consistency
        const groupRevenue = (group.payments || [])
          .filter(p => p.month === month)
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        if (groupRevenue > 0 || isStaffTeaching) {
          const kpiPercentage = Number(effectiveKpiPercentage) || 0;
          const groupKpi = (groupRevenue * kpiPercentage) / 100;

          if (effectiveSalaryType === 'KPI' || effectiveSalaryType === 'MIXED') {
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
    
    await this.notificationsService.sendToStaff(
      staffId,
      "Oylik to'lovi",
      `Sizga ${Number(data.amount).toLocaleString('uz-UZ')} so'm miqdorida to'lov qabul qilindi (Turi: ${data.type || 'maosh'}).`
    ).catch(err => console.error('Failing to send staff payment notification:', err));

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
    
    const salaryStartMonth = (data as any).salaryStartMonth;
    if (salaryStartMonth) {
      // Check if this staff has any existing salary configs
      const existingConfigs = await this.staffSalaryConfigRepo.find({
        where: { staffId: id }
      });

      // If no configs exist yet, create a baseline config with the CURRENT (old) values
      // so that months before the new start month will still use the old salary settings
      if (existingConfigs.length === 0) {
        const baseline = new StaffSalaryConfig();
        baseline.staffId = id;
        baseline.month = '2000-01'; // earliest possible baseline
        baseline.salaryType = staff.salaryType;
        baseline.fixedAmount = Number(staff.fixedAmount) || 0;
        baseline.kpiPercentage = Number(staff.kpiPercentage) || 0;
        await this.staffSalaryConfigRepo.save(baseline);
      }

      let config = await this.staffSalaryConfigRepo.findOne({
        where: { staffId: id, month: salaryStartMonth }
      });
      if (!config) {
        config = new StaffSalaryConfig();
        config.staffId = id;
        config.month = salaryStartMonth;
      }
      config.salaryType = data.salaryType !== undefined ? data.salaryType : staff.salaryType;
      config.fixedAmount = data.fixedAmount !== undefined ? Number(data.fixedAmount) : staff.fixedAmount;
      config.kpiPercentage = data.kpiPercentage !== undefined ? Number(data.kpiPercentage) : staff.kpiPercentage;
      await this.staffSalaryConfigRepo.save(config);

      // Determine if this month is the latest config month
      const allConfigs = await this.staffSalaryConfigRepo.find({
        where: { staffId: id }
      });
      const isLatest = allConfigs.every(c => c.month <= salaryStartMonth);
      if (isLatest) {
        // Keep Staff columns in sync with the latest config
        staff.salaryType = config.salaryType;
        staff.fixedAmount = config.fixedAmount;
        staff.kpiPercentage = config.kpiPercentage;
      }

      delete (data as any).salaryStartMonth;
      // Remove salary settings from data so Object.assign doesn't overwrite the staff record
      // if it's NOT the latest config!
      if (!isLatest) {
        delete (data as any).salaryType;
        delete (data as any).fixedAmount;
        delete (data as any).kpiPercentage;
      }
    }

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

  // --- Certificate Requests ---
  async getAllCertificateRequests(): Promise<CertificateRequest[]> {
    return this.certificateRequestRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateCertificateRequestStatus(id: number, status: string): Promise<CertificateRequest> {
    const request = await this.certificateRequestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Certificate request not found');
    request.status = status;
    return this.certificateRequestRepo.save(request);
  }

  async deleteCertificateRequest(id: number): Promise<void> {
    const request = await this.certificateRequestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Certificate request not found');
    await this.certificateRequestRepo.remove(request);
  }
}
