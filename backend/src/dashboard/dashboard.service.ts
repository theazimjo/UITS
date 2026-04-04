import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { Enrollment } from '../groups/entities/enrollment.entity';
import { EnrollmentStatus } from '../groups/enums/enrollment-status.enum';
import { GroupStatus } from '../groups/enums/group-status.enum';
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
  ) {}

  async getTodayAttendanceStats() {
    const today = new Date();
    // Use Uzbekistan-safe YYYY-MM-DD that avoids UTC rollover issues 
    // And handle the case where day/month might need to be non-zero-padded if the API is sensitive
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const todayStr = `${y}-${m}-${d}`; 
    
    const dayNames = ['Yaksh', 'Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'];
    const currentDayUz = dayNames[today.getDay()];

    // 1. Find ACTIVE groups that have classes today
    const activeGroups = await this.groupRepo.find({
      where: { status: GroupStatus.ACTIVE },
      relations: ['enrollments', 'enrollments.student']
    });

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
    if (totalExpected === 0) return { expected: 0, arrived: 0, percentage: 0, students: [] };

    // 3. Fetch attendance from 5 teachers parallel
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

      // Flatten all teacher responses into a single pool
      const allApiStudents = attendanceResults.flat();

      // 4. Build detailed student list and calculate arrived count
      const uniqueStudentMap = new Map<number, any>();
      let arrivedCount = 0;

      groupsToday.forEach(g => {
        g.enrollments.forEach(e => {
          if (e.status === EnrollmentStatus.ACTIVE && e.student && e.student.externalId) {
            const extId = e.student.externalId;
            
            // Replicate the exact find logic from StudentsService
            const arrivalData = allApiStudents.find(s => 
              (s.hikvision_id && s.hikvision_id.toString() === extId) || 
              (s.id && s.id.toString() === extId)
            );

            const isPresent = arrivalData?.today_status === 'present';
            
            if (!uniqueStudentMap.has(e.student.id)) {
              const studentInfo = {
                id: e.student.id,
                name: e.student.name,
                groupName: g.name,
                externalId: extId,
                status: isPresent ? 'present' : 'absent',
                status_display: isPresent ? 'Kelgan' : 'Kelmagan',
                arrivedAt: isPresent ? arrivalData?.arrived_at : null,
                leftAt: isPresent ? arrivalData?.left_at : null,
                photo: e.student.photo
              };
              uniqueStudentMap.set(e.student.id, studentInfo);
              if (isPresent) arrivedCount++;
            }
          }
        });
      });

      const finalStudents = Array.from(uniqueStudentMap.values());
      
      // Sort: Present (Kelgan) students at the top to see times immediately
      finalStudents.sort((a, b) => a.status === 'present' ? -1 : 1);

      return {
        expected: totalExpected,
        arrived: arrivedCount,
        percentage: Math.round((arrivedCount / totalExpected) * 100),
        students: finalStudents
      };
    } catch (e) {
      console.error('Dashboard attendance check error:', e.message);
      return { expected: totalExpected, arrived: 0, percentage: 0, students: [] };
    }
  }
}
