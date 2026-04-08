import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { Enrollment } from '../groups/entities/enrollment.entity';
import { Payment } from '../payments/entities/payment.entity';
import { GroupPhase } from '../groups/entities/group-phase.entity';
import { Staff } from './entities/staff.entity';
import { EnrollmentStatus } from '../groups/enums/enrollment-status.enum';
import { GroupStatus } from '../groups/enums/group-status.enum';
import { AttendanceRecord } from '../students/entities/attendance-record.entity';
import axios from 'axios';
import * as https from 'https';

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  timeout: 30000,
});

@Controller('teacher')
export class TeacherController {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    @InjectRepository(GroupPhase)
    private readonly groupPhaseRepo: Repository<GroupPhase>,
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRecordRepo: Repository<AttendanceRecord>,
  ) {}

  // GET /teacher/dashboard — dashboard stats for the logged-in teacher
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Req() req: any, @Query('month') monthStr?: string) {
    const staffId = req.user.userId;
    const targetMonth = monthStr || new Date().toISOString().slice(0, 7);

    const groups = await this.groupRepo.find({
      where: { teacherId: staffId },
      relations: ['enrollments', 'enrollments.student', 'course'],
    });

    const activeGroups = groups.filter(
      (g) => g.status === GroupStatus.ACTIVE || g.status === GroupStatus.WAITING,
    );

    // Unique active students across all teacher's groups
    const studentMap = new Map<number, any>();
    activeGroups.forEach((g) => {
      g.enrollments?.forEach((e) => {
        if (e.status === EnrollmentStatus.ACTIVE && e.student) {
          studentMap.set(e.student.id, {
            id: e.student.id,
            name: e.student.name,
          });
        }
      });
    });

    // Monthly payments (Calculating from ALL groups assigned to this teacher)
    const allGroupIds = groups.map((g) => g.id);
    let monthlyIncome = 0;
    if (allGroupIds.length > 0) {
      const payments = await this.paymentRepo
        .createQueryBuilder('p')
        .where('p.groupId IN (:...ids)', { ids: allGroupIds })
        .andWhere('p.month = :month', { month: targetMonth })
        .getMany();
      monthlyIncome = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    }

    // Expected Income (Only for CURRENTLY active groups in the selected month)
    const expectedIncome = activeGroups.reduce((sum, g) => {
      const activeCount = g.enrollments?.filter(e => e.status === EnrollmentStatus.ACTIVE).length || 0;
      return sum + (activeCount * Number(g.monthlyPrice || 0));
    }, 0);

    // Financial Trend (Based on target month)
    const [targetY, targetM] = targetMonth.split('-').map(Number);
    const financialTrend: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(targetY, (targetM - 1) - i, 1);
      const m = d.toISOString().slice(0, 7);
      
      let income = 0;
      if (allGroupIds.length > 0) {
        const pms = await this.paymentRepo
          .createQueryBuilder('p')
          .where('p.groupId IN (:...ids)', { ids: allGroupIds })
          .andWhere('p.month = :month', { month: m })
          .getMany();
        income = pms.reduce((sum, p) => sum + Number(p.amount), 0);
      }
      financialTrend.push({ month: m, income });
    }

    // Student Distribution
    const studentDistribution = activeGroups.map(g => ({
      name: g.name,
      value: g.enrollments?.filter(e => e.status === EnrollmentStatus.ACTIVE).length || 0,
    })).filter(d => d.value > 0);

    return {
      month: targetMonth,
      totalGroups: activeGroups.length,
      totalStudents: studentMap.size,
      monthlyIncome,
      expectedIncome,
      financialTrend,
      studentDistribution,
      groups: activeGroups.map((g) => ({
        id: g.id,
        name: g.name,
        status: g.status,
        days: g.days,
        startTime: g.startTime,
        endTime: g.endTime,
        courseName: g.course?.name,
        studentCount: g.enrollments?.filter((e) => e.status === EnrollmentStatus.ACTIVE).length || 0,
        monthlyPrice: g.monthlyPrice,
      })),
    };
  }

  // GET /teacher/my-groups — all groups assigned to this teacher
  @UseGuards(JwtAuthGuard)
  @Get('my-groups')
  async getMyGroups(@Req() req: any) {
    const staffId = req.user.userId;

    // 1. Current groups
    const currentGroups = await this.groupRepo.find({
      where: { teacherId: staffId },
      relations: [
        'enrollments',
        'enrollments.student',
        'course',
        'room',
        'phases',
        'phases.teacher',
      ],
    });

    // 2. Historical groups from phases
    const historicalPhases = await this.groupPhaseRepo.find({
      where: { teacherId: staffId },
      relations: [
        'group',
        'group.enrollments',
        'group.enrollments.student',
        'group.course',
        'group.room',
        'group.phases',
        'group.phases.teacher',
      ],
    });

    // Combine unique groups
    const groupMap = new Map<number, any>();

    currentGroups.forEach((g) => {
      groupMap.set(g.id, { ...g, isTransferred: false });
    });

    historicalPhases.forEach((p) => {
      if (p.group && !groupMap.has(p.group.id)) {
        groupMap.set(p.group.id, {
          ...p.group,
          isTransferred: p.group.teacherId !== staffId,
        });
      }
    });

    return Array.from(groupMap.values());
  }

  // GET /teacher/my-students — all active students in teacher's groups
  @UseGuards(JwtAuthGuard)
  @Get('my-students')
  async getMyStudents(@Req() req: any) {
    const staffId = req.user.userId;
    const groups = await this.groupRepo.find({
      where: [
        { teacherId: staffId, status: GroupStatus.ACTIVE },
        { teacherId: staffId, status: GroupStatus.WAITING },
      ],
      relations: ['enrollments', 'enrollments.student'],
    });

    const studentMap = new Map<number, any>();
    groups.forEach((g) => {
      g.enrollments?.forEach((e) => {
        if (e.status === EnrollmentStatus.ACTIVE && e.student) {
          if (!studentMap.has(e.student.id)) {
            studentMap.set(e.student.id, {
              ...e.student,
              groups: [{ id: g.id, name: g.name }],
            });
          } else {
            studentMap.get(e.student.id).groups.push({ id: g.id, name: g.name });
          }
        }
      });
    });

    return Array.from(studentMap.values());
  }

  // GET /teacher/my-attendance?date=YYYY-MM-DD&sync=true — attendance for teacher's students
  @UseGuards(JwtAuthGuard)
  @Get('my-attendance')
  async getMyAttendance(
    @Req() req: any, 
    @Query('date') dateStr?: string,
    @Query('sync') sync?: string
  ) {
    const staffId = req.user.userId;
    const isForcedSync = sync === 'true';
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const targetMonth = targetDate.slice(0, 7);
    const [year, month] = targetMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    const monthStart = `${targetMonth}-01`;
    const monthEnd = `${targetMonth}-${String(daysInMonth).padStart(2, '0')}`;

    // 1. Broad Discovery: Get students from both direct Group assignments and GroupPhases
    const [directGroups, phases] = await Promise.all([
      this.groupRepo.find({
        where: { teacherId: staffId, status: GroupStatus.ACTIVE },
        relations: ['enrollments', 'enrollments.student'],
      }),
      this.groupPhaseRepo.find({
        where: { teacherId: staffId },
        relations: ['group', 'group.enrollments', 'group.enrollments.student'],
      })
    ]);

    const studentMap = new Map<number, any>();

    const addStudentsFromGroup = (group: Group) => {
      if (!group || !group.enrollments) return;
      group.enrollments.forEach((e) => {
        if ((e.status === EnrollmentStatus.ACTIVE || e.status === EnrollmentStatus.GRADUATED) && e.student) {
          if (!studentMap.has(e.student.id)) {
            studentMap.set(e.student.id, {
              id: e.student.id,
              name: e.student.name,
              photo: e.student.photo,
              externalId: e.student.externalId || null,
              groupName: group.name,
              groupId: group.id,
              attendance: {} as Record<string, any>,
            });
          }
        }
      });
    };

    directGroups.forEach(g => addStudentsFromGroup(g));
    phases.forEach((p) => {
      const pStart = p.startDate;
      const pEnd = p.endDate || '9999-12-31';
      if (pStart <= monthEnd && pEnd >= monthStart) {
        addStudentsFromGroup(p.group);
      }
    });

    const students = Array.from(studentMap.values());
    const studentsWithId = students.filter(s => s.externalId);

    // 2. Caching layer: Check for existing records in our DB
    if (!isForcedSync) {
      const extIds = studentsWithId.map(s => s.externalId);
      if (extIds.length > 0) {
        const cachedRecords = await this.attendanceRecordRepo.createQueryBuilder('ar')
          .where('ar.externalId IN (:...ids)', { ids: extIds })
          .andWhere('ar.date >= :start AND ar.date <= :end', { start: monthStart, end: monthEnd })
          .getMany();

        if (cachedRecords.length > 0) {
          cachedRecords.forEach(rec => {
            const student = studentsWithId.find(s => s.externalId === rec.externalId);
            if (student) {
              const dayNum = parseInt(rec.date.split('-')[2]);
              student.attendance[dayNum] = {
                status: rec.status,
                arrived_at: rec.arrivedAt,
                left_at: rec.leftAt
              };
            }
          });
          return { month: targetMonth, daysInMonth, students, fromCache: true };
        }
      }
    }

    // 3. Fetch from External API
    try {
      const attendancePromises = studentsWithId.map(async (student) => {
        try {
          const response = await axios.get(
            `https://schoolmanage.uz/api/student/${student.externalId}?date=${targetDate}`,
            { headers: { 'X-Employee-ID': '1' }, httpsAgent, timeout: 10000 },
          );
          const records = response.data.recent_attendance || [];
          
          for (const rec of records) {
            const recDateStr = rec.date;
            if (recDateStr.startsWith(targetMonth)) {
              const day = parseInt(recDateStr.split('-')[2]);
              const status = rec.status?.toLowerCase() === 'present' ? 'present' : 'absent';
              const arrTime = rec.arrived_at && rec.arrived_at !== 'None' && rec.arrived_at !== '0' ? rec.arrived_at : null;
              const depTime = rec.left_at && rec.left_at !== 'None' && rec.left_at !== '0' ? rec.left_at : null;

              student.attendance[day] = { status, arrived_at: arrTime, left_at: depTime };

              // Update cache
              await this.attendanceRecordRepo.upsert({
                externalId: student.externalId,
                date: recDateStr,
                status,
                arrivedAt: arrTime,
                leftAt: depTime
              }, ['externalId', 'date']);
            }
          }
        } catch (e) {
          console.error(`Fetch error for ${student.name}:`, e.message);
        }
      });
      await Promise.all(attendancePromises);
    } catch (e) {
      console.error('Bulk fetch error:', e.message);
    }

    return { month: targetMonth, daysInMonth, students, fromCache: false };
  }

  // GET /teacher/my-finance?month=YYYY-MM — payments for teacher's groups
  @UseGuards(JwtAuthGuard)
  @Get('my-finance')
  async getMyFinance(@Req() req: any, @Query('month') month?: string) {
    const staffId = req.user.userId;
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const groups = await this.groupRepo.find({
      where: { teacherId: staffId },
      relations: ['enrollments', 'enrollments.student'],
    });

    const groupIds = groups.map((g) => g.id);
    if (groupIds.length === 0) {
      return { totalIncome: 0, payments: [], groups: [], month: targetMonth };
    }

    const payments = await this.paymentRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.student', 'student')
      .leftJoinAndSelect('p.group', 'group')
      .where('p.groupId IN (:...ids)', { ids: groupIds })
      .andWhere('p.month = :month', { month: targetMonth })
      .orderBy('p.paymentDate', 'DESC')
      .getMany();

    const totalIncome = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Per-group breakdown
    const groupStats = groups
      .filter((g) => g.status === GroupStatus.ACTIVE || g.status === GroupStatus.WAITING)
      .map((g) => {
        const gPayments = payments.filter((p) => p.group?.id === g.id);
        const activeStudents = g.enrollments?.filter((e) => e.status === EnrollmentStatus.ACTIVE).length || 0;
        const paidStudents = new Set(gPayments.map((p) => p.student?.id)).size;
        return {
          id: g.id,
          name: g.name,
          activeStudents,
          paidStudents,
          totalCollected: gPayments.reduce((s, p) => s + Number(p.amount), 0),
          monthlyPrice: Number(g.monthlyPrice),
        };
      });

    return {
      totalIncome,
      month: targetMonth,
      payments: payments.map((p) => ({
        id: p.id,
        studentName: p.student?.name || 'Noma\'lum',
        groupName: p.group?.name || '',
        amount: Number(p.amount),
        paymentDate: p.paymentDate,
        paymentType: p.paymentType,
      })),
      groups: groupStats,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('group-payments/:id')
  async getGroupPayments(
    @Req() req: any,
    @Param('id') id: string,
    @Query('month') month: string,
  ) {
    const staffId = req.user.userId;

    // Verify if teacher is/was part of this group
    const isTeacher = await this.groupRepo.findOne({
      where: { id: parseInt(id), teacherId: staffId },
    });
    const isHistorical = await this.groupPhaseRepo.findOne({
      where: { group: { id: parseInt(id) }, teacherId: staffId },
    });

    if (!isTeacher && !isHistorical) {
      throw new ForbiddenException('You do not have access to this group');
    }

    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const payments = await this.paymentRepo.find({
      where: {
        group: { id: parseInt(id) },
        month: targetMonth,
      },
      relations: ['student'],
    });

    return payments;
  }
}
