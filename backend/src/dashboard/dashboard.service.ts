import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { Enrollment } from '../groups/entities/enrollment.entity';
import { EnrollmentStatus } from '../groups/enums/enrollment-status.enum';
import { GroupStatus } from '../groups/enums/group-status.enum';
import { Payment } from '../payments/entities/payment.entity';
import { Student } from '../students/entities/student.entity';
import axios from 'axios';
import * as https from 'https';

// Optimized agent for parallel requests
const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 30, // Dashboard only needs ~5-10 but lets keep it healthy
  maxFreeSockets: 5,
  timeout: 60000,
});

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
  ) { }

  private parseDateUz(dateStr?: string) {
    let date: Date;
    if (dateStr) {
      const [y, m, d] = dateStr.split('-').map(Number);
      date = new Date(Date.UTC(y, m - 1, d));
    } else {
      const now = new Date();
      // Use local date converted to UTC midnight for consistency if no string provided
      date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    }

    const yyyymmdd = date.toISOString().slice(0, 10);
    const yyyymm = yyyymmdd.slice(0, 7);
    const dayNames = ['Yaksh', 'Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'];
    const dayUz = dayNames[date.getUTCDay()];

    return { date, yyyymm, yyyymmdd, dayUz };
  }

  async getGeneralStats(date?: string) {
    const { date: targetDate, yyyymm: targetMonthStr, yyyymmdd: targetDateStr } = this.parseDateUz(date);

    // 1. Student Growth (Last 6 Months relative to targetDate)
    const students = await this.studentRepo.find({
      order: { createdAt: 'ASC' }
    });

    const studentGrowth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(targetDate);
      d.setMonth(d.getMonth() - i);
      const mStr = d.toISOString().slice(0, 7);

      const count = students.filter(s => s.createdAt && s.createdAt.toISOString().slice(0, 7) === mStr).length;
      studentGrowth.push({ month: mStr, count });
    }

    // 2. Group Status Distribution
    const allGroups = await this.groupRepo.find({
      relations: ['enrollments', 'enrollments.student']
    });
    const groupStatus = [
      { name: 'Faol', value: allGroups.filter(g => g.status === GroupStatus.ACTIVE).length },
      { name: 'Kutilmoqda', value: allGroups.filter(g => g.status === GroupStatus.WAITING).length },
      { name: 'Yakunlangan', value: allGroups.filter(g => g.status === GroupStatus.COMPLETED).length },
    ];


    // For payments, always take the most recent 20 globally (as requested)
    const recentPayments = await this.paymentRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.student', 'student')
      .orderBy('p.paymentDate', 'DESC')
      .take(20)
      .getMany();

    // For students, always find most recent 20 globally (as requested for activities)
    const filteredStudents = await this.studentRepo.find({
      order: { createdAt: 'DESC' },
      take: 20
    });

    const activity = [
      ...recentPayments.map(p => ({
        type: p.amount < 0 ? 'EXPENSE' : 'PAYMENT',
        title: p.amount < 0 ? `Xarajat: ${p.collectedBy || 'Nomalum'}` : `${p.student?.name || 'Talaba'} to'lov qildi`,
        subtitle: `${Math.abs(Number(p.amount)).toLocaleString()} UZS`,
        date: p.paymentDate,
        icon: p.amount < 0 ? 'Wallet' : 'Banknote'
      })),
      ...filteredStudents.map(s => ({
        type: 'STUDENT',
        title: `Yangi talaba: ${s.name}`,
        subtitle: s.phone || 'Tel raqamsiz',
        date: s.createdAt,
        icon: 'UserPlus'
      }))
    ];

    // Final sorting and trimming (Last 10 as requested)
    const finalActivity = activity
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    // 3. New Advanced Stats for User Request
    const activeGroups = allGroups.filter(g => g.status === GroupStatus.ACTIVE);

    // Calculate Monthly Expected Revenue
    let totalExpectedMonth = 0;
    activeGroups.forEach(g => {
      const activeEnrollments = (g.enrollments || []).filter(e => e.status === EnrollmentStatus.ACTIVE);
      totalExpectedMonth += (Number(g.monthlyPrice) || 0) * activeEnrollments.length;
    });

    // Calculate Actual Revenue for this month
    const monthPayments = await this.paymentRepo.find({
      where: { month: targetMonthStr },
      relations: ['student', 'group']
    });

    const totalActualMonth = monthPayments.reduce((acc, p) => {
      const amt = Number(p.amount) || 0;
      const disc = Number(p.discount) || 0;
      const pen = Number(p.penalty) || 0;
      // Only count positive payments as revenue for this metric
      return amt > 0 ? acc + amt : acc;
    }, 0);

    const paymentPercentage = totalExpectedMonth > 0
      ? Math.min(100, Math.round((totalActualMonth / totalExpectedMonth) * 100))
      : 0;

    // Calculate Debtor Count
    // A debtor is an active student in an active group who hasn't paid the full monthlyPrice for the targetMonthStr
    // keyed by studentId-groupId to support multiple groups per student
    const studentGroupPaymentMap = new Map<string, number>();
    monthPayments.forEach(p => {
      if (p.student && p.group) {
        const key = `${p.student.id}-${p.group.id}`;
        const current = studentGroupPaymentMap.get(key) || 0;
        // Student credit = amount + discount - penalty
        studentGroupPaymentMap.set(key, current + (Number(p.amount) + Number(p.discount) - Number(p.penalty)));
      }
    });

    let debtorCount = 0;
    activeGroups.forEach(g => {
      const price = Number(g.monthlyPrice) || 0;
      (g.enrollments || []).forEach(e => {
        if (e.status === EnrollmentStatus.ACTIVE && e.student) {
          const key = `${e.student.id}-${g.id}`;
          const paid = studentGroupPaymentMap.get(key) || 0;
          if (paid < price) {
            debtorCount++;
          }
        }
      });
    });

    return {
      studentGrowth,
      groupStatus,
      activity: finalActivity,
      totalStudents: students.length,
      totalGroups: allGroups.length,
      activeGroupsCount: activeGroups.length,
      debtorCount,
      paymentPercentage,
      totalExpectedMonth,
      totalActualMonth
    };
  }

  async getTodayAttendanceStats(date?: string) {
    const { yyyymmdd: targetDateStr, dayUz: targetDayUz, yyyymm: targetMonth } = this.parseDateUz(date);
    const todayStr = new Date().toISOString().slice(0, 10);
    const isToday = targetDateStr === todayStr;

    // 1. Find groups for the target day/month
    const relevantGroups = await this.groupRepo.find({
      where: [
        { status: GroupStatus.ACTIVE },
        { status: GroupStatus.WAITING }
      ],
      relations: ['enrollments', 'enrollments.student']
    });

    const validGroups = relevantGroups.filter(g =>
      g.status === GroupStatus.ACTIVE || g.status === GroupStatus.WAITING
    );
    const groupsOnTargetDay = validGroups.filter(g => g.days && g.days.includes(targetDayUz));

    let totalExpected = 0;
    let arrivedCount = 0;
    let finalStudents: any[] = [];

    // Identify unique expected students 
    const expectedStudents = new Set<string>();
    groupsOnTargetDay.forEach(g => {
      if (!g.enrollments) return;
      g.enrollments.forEach(e => {
        if ((e.status === EnrollmentStatus.ACTIVE || !e.status) && e.student && e.student.externalId) {
          expectedStudents.add(e.student.externalId);
        }
      });
    });
    totalExpected = expectedStudents.size;

    // Fetch External Attendance for target date
    const ids = ['1', '2', '3', '4', '5'];
    try {
      const attendanceResults = await Promise.all(
        ids.map(id =>
          axios.get(`https://schoolmanage.uz/api/teacher/classroom/?date=${targetDateStr}`, {
            headers: { 'X-Employee-ID': id },
            httpsAgent,
          }).then(res => res.data.students || []).catch(() => [])
        )
      );

      const allApiStudents = attendanceResults.flat();
      const uniqueStudentMap = new Map<number, any>();

      groupsOnTargetDay.forEach(g => {
        g.enrollments.forEach(e => {
          if (e.status === EnrollmentStatus.ACTIVE && e.student && e.student.externalId) {
            const extId = e.student.externalId;
            const arrivalData = allApiStudents.find(s => {
              const apiId = s.id?.toString();
              const apiHik = s.hikvision_id?.toString();
              return (apiId && apiId === extId) || (apiHik && apiHik === extId);
            });

            const isPresent = arrivalData?.today_status?.toLowerCase() === 'present';

            if (!uniqueStudentMap.has(e.student.id)) {
              const arrTime = arrivalData?.arrived_at;
              const depTime = arrivalData?.left_at;

              uniqueStudentMap.set(e.student.id, {
                id: e.student.id,
                name: e.student.name,
                groupName: g.name,
                externalId: extId,
                status: isPresent ? 'present' : 'absent',
                status_display: isPresent ? 'Kelgan' : 'Kelmagan',
                arrivedAt: (arrTime && arrTime !== 'None' && arrTime !== '0') ? arrTime : null,
                leftAt: (depTime && depTime !== 'None' && depTime !== '0') ? depTime : null,
                photo: e.student.photo
              });
              if (isPresent) arrivedCount++;
            }
          }
        });
      });
      finalStudents = Array.from(uniqueStudentMap.values());
    } catch (e) {
      console.error('Attendance API error:', e.message);
    }

    // 4. Financial Metrics
    const parseSafe = (val: any) => {
      if (val === null || val === undefined) return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    let expectedMonthlyRevenue = 0;
    relevantGroups.forEach(g => {
      const activeEnrollments = (g.enrollments || []).filter(e => e.status === EnrollmentStatus.ACTIVE);
      expectedMonthlyRevenue += parseSafe(g.monthlyPrice) * activeEnrollments.length;
    });

    const dayPayments = await this.paymentRepo.createQueryBuilder('p')
      .where('p.paymentDate = :targetDate', { targetDate: targetDateStr })
      .getMany();

    // Sum only non-expense payments for revenue or combined? 
    // Usually revenue = sum(amount - discount + penalty)
    const dayRevenue = dayPayments.reduce((acc, p) =>
      acc + (parseSafe(p.amount) - parseSafe(p.discount) + parseSafe(p.penalty)), 0);

    const monthPayments = await this.paymentRepo.createQueryBuilder('p')
      .where('p.month = :targetMonth', { targetMonth })
      .getMany();
    const totalMonthRevenue = monthPayments.reduce((acc, p) =>
      acc + (parseSafe(p.amount) - parseSafe(p.discount) + parseSafe(p.penalty)), 0);

    return {
      expected: totalExpected,
      arrived: arrivedCount,
      percentage: totalExpected > 0 ? Math.round((arrivedCount / totalExpected) * 100) : 0,
      students: finalStudents,
      expectedMonthlyRevenue,
      todayRevenue: dayRevenue,
      totalMonthRevenue,
      isHistory: !isToday,
      date: targetDateStr
    };
  }
}
