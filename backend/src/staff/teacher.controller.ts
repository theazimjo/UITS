import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { Enrollment } from '../groups/entities/enrollment.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Staff } from './entities/staff.entity';
import { EnrollmentStatus } from '../groups/enums/enrollment-status.enum';
import { GroupStatus } from '../groups/enums/group-status.enum';
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
  ) {}

  // GET /teacher/dashboard — dashboard stats for the logged-in teacher
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    const staffId = req.user.userId;

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
            photo: e.student.photo,
            groupName: g.name,
          });
        }
      });
    });

    // Today's attendance quick stats
    const today = new Date().toISOString().split('T')[0];
    const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const todayDayUz = dayNames[new Date().getDay()];
    const todayGroups = activeGroups.filter((g) => g.days?.includes(todayDayUz));

    let todayExpected = 0;
    todayGroups.forEach((g) => {
      g.enrollments?.forEach((e) => {
        if (e.status === EnrollmentStatus.ACTIVE) todayExpected++;
      });
    });

    // Current month payments
    const currentMonth = new Date().toISOString().slice(0, 7);
    const groupIds = activeGroups.map((g) => g.id);
    let monthlyIncome = 0;
    if (groupIds.length > 0) {
      const payments = await this.paymentRepo
        .createQueryBuilder('p')
        .where('p.groupId IN (:...ids)', { ids: groupIds })
        .andWhere('p.month = :month', { month: currentMonth })
        .getMany();
      monthlyIncome = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    }

    return {
      totalGroups: activeGroups.length,
      totalStudents: studentMap.size,
      todayExpected,
      todayGroupsCount: todayGroups.length,
      monthlyIncome,
      groups: activeGroups.map((g) => ({
        id: g.id,
        name: g.name,
        status: g.status,
        days: g.days,
        startTime: g.startTime,
        endTime: g.endTime,
        courseName: g.course?.name,
        studentCount: g.enrollments?.filter((e) => e.status === EnrollmentStatus.ACTIVE).length || 0,
      })),
    };
  }

  // GET /teacher/my-groups — all groups assigned to this teacher
  @UseGuards(JwtAuthGuard)
  @Get('my-groups')
  async getMyGroups(@Req() req: any) {
    const staffId = req.user.userId;
    const groups = await this.groupRepo.find({
      where: { teacherId: staffId },
      relations: ['enrollments', 'enrollments.student', 'course', 'room', 'phases', 'phases.course'],
    });
    return groups;
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

  // GET /teacher/my-attendance?date=YYYY-MM-DD — attendance for teacher's students
  @UseGuards(JwtAuthGuard)
  @Get('my-attendance')
  async getMyAttendance(@Req() req: any, @Query('date') dateStr?: string) {
    const staffId = req.user.userId;
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const targetMonth = targetDate.slice(0, 7);
    const [year, month] = targetMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Get teacher's active groups
    const groups = await this.groupRepo.find({
      where: [
        { teacherId: staffId, status: GroupStatus.ACTIVE },
        { teacherId: staffId, status: GroupStatus.WAITING },
      ],
      relations: ['enrollments', 'enrollments.student'],
    });

    // Collect unique students with external IDs
    const studentMap = new Map<number, any>();
    groups.forEach((g) => {
      g.enrollments?.forEach((e) => {
        if (e.status === EnrollmentStatus.ACTIVE && e.student?.externalId) {
          if (!studentMap.has(e.student.id)) {
            studentMap.set(e.student.id, {
              id: e.student.id,
              name: e.student.name,
              photo: e.student.photo,
              externalId: e.student.externalId,
              groupName: g.name,
              groupId: g.id,
              attendance: {} as Record<string, string>, // date -> status
            });
          }
        }
      });
    });

    // Fetch attendance from external API for entire month
    const students = Array.from(studentMap.values());

    try {
      const attendancePromises = students.map(async (student) => {
        try {
          const response = await axios.get(
            `https://schoolmanage.uz/api/student/${student.externalId}`,
            { headers: { 'X-Employee-ID': '1' }, httpsAgent, timeout: 10000 },
          );
          const records = response.data.recent_attendance || [];
          records.forEach((rec: any) => {
            const recDate = new Date(rec.date);
            if (recDate.getMonth() + 1 === month && recDate.getFullYear() === year) {
              const day = recDate.getDate();
              student.attendance[day] = rec.status?.toLowerCase() === 'present' ? 'present' : 'absent';
            }
          });
        } catch {
          // Skip failed fetches
        }
      });

      await Promise.all(attendancePromises);
    } catch {
      // Ignore bulk errors
    }

    return {
      month: targetMonth,
      daysInMonth,
      students,
    };
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
}
