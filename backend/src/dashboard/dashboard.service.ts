import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { Enrollment } from '../groups/entities/enrollment.entity';
import { EnrollmentStatus } from '../groups/enums/enrollment-status.enum';
import { GroupStatus } from '../groups/enums/group-status.enum';
import { Payment } from '../payments/entities/payment.entity';
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
  ) {}

  async getTodayAttendanceStats() {
    const today = new Date();
    // Use Uzbekistan-safe YYYY-MM-DD that avoids UTC rollover issues 
    // And handle the case where day/month might need to be non-zero-padded if the API is sensitive
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`; 
    
    const dayNames = ['Yaksh', 'Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'];
    const currentDayUz = dayNames[today.getDay()];

    // 1. Find ACTIVE or WAITING groups
    const relevantGroups = await this.groupRepo.find({
      where: [
        { status: GroupStatus.ACTIVE },
        { status: GroupStatus.WAITING }
      ],
      relations: ['enrollments', 'enrollments.student']
    });

    const activeGroups = relevantGroups.filter(g => g.status === GroupStatus.ACTIVE);
    const groupsToday = activeGroups.filter(g => g.days && g.days.includes(currentDayUz));
    
    // 2. Identify unique expected students (external IDs)
    const expectedStudents = new Set<string>();
    groupsToday.forEach(g => {
      g.enrollments.forEach(e => {
        if (e.status === EnrollmentStatus.ACTIVE && e.student && e.student.externalId) {
          expectedStudents.add(e.student.externalId);
        }
      });
    });

    const totalExpected = expectedStudents.size;

    // 4. Calculate Financial Metrics (Move outside API try block for stability)
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

    const todayPayments = await this.paymentRepo.find({
      where: { paymentDate: todayStr }
    });
    const todayRevenue = todayPayments.reduce((acc, p) => 
      acc + (parseSafe(p.amount) - parseSafe(p.discount) + parseSafe(p.penalty)), 0);

    // 5. Fetch External Attendance (This part can fail without affecting revenue)
    let arrivedCount = 0;
    let finalStudents: any[] = [];

    const ids = ['1', '2', '3', '4', '5'];
    try {
      const attendanceResults = await Promise.all(
        ids.map(id => 
          axios.get(`https://schoolmanage.uz/api/teacher/classroom/?date=${todayStr}`, {
            headers: { 'X-Employee-ID': id },
            httpsAgent,
          }).then(res => res.data.students || []).catch(() => [])
        )
      );

      const allApiStudents = attendanceResults.flat();
      const uniqueStudentMap = new Map<number, any>();

      groupsToday.forEach(g => {
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
      finalStudents.sort((a, b) => a.status === 'present' ? -1 : 1);
    } catch (e) {
      console.error('Attendance API error (Revenue still shown):', e.message);
    }

    return {
      expected: totalExpected,
      arrived: arrivedCount,
      percentage: totalExpected > 0 ? Math.round((arrivedCount / totalExpected) * 100) : 0,
      students: finalStudents,
      expectedMonthlyRevenue,
      todayRevenue
    };
  }
}
