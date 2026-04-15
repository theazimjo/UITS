import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import axios from 'axios';
import * as https from 'https';
import { StudentStatus } from './enums/student-status.enum';
import { AttendanceRecord } from './entities/attendance-record.entity';

// Optimized agent for high-concurrency parallel requests (31 days)
const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 100, // Allow 100 concurrent sockets
  maxFreeSockets: 10,
  timeout: 60000,
  rejectUnauthorized: false, // Fallback for external APIs with strict/outdated SSL certs
});

@Injectable()
export class StudentsService {
  // In-memory cache for student to teacher (classroom) mapping
  // Map<externalId, employeeId>
  private static teacherCache = new Map<string, string>();

  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRecordRepo: Repository<AttendanceRecord>,
  ) {}

  async onApplicationBootstrap() {
    const tables = await this.studentsRepository.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    );
    console.log('Mavjud jadvallar:', tables.map((t) => t.table_name).join(', '));
  }

  async findAll(): Promise<Student[]> {
    return this.studentsRepository.find({ relations: ['enrollments', 'enrollments.group', 'payments'] });
  }

  async findOne(id: number): Promise<Student | null> {
    return this.studentsRepository.findOne({ where: { id }, relations: ['enrollments', 'enrollments.group', 'payments'] });
  }

  async update(id: number, data: Partial<Student>): Promise<Student | null> {
    const student = await this.studentsRepository.findOne({ where: { id } });
    if (!student) return null;
    
    Object.assign(student, data);
    return this.studentsRepository.save(student);
  }

  private async findCorrectEmployeeID(externalId: string, dateStr?: string): Promise<string | null> {
    // 1. Check persistent in-memory cache first
    if (StudentsService.teacherCache.has(externalId)) {
      return StudentsService.teacherCache.get(externalId) || null;
    }

    const searchDate = dateStr || new Date().toISOString().split('T')[0];
    const ids = ['1', '2', '3', '4', '5'];
    
    try {
      const results = await Promise.all(
        ids.map(id => 
          axios.get(`https://schoolmanage.uz/api/teacher/classroom/?date=${searchDate}`, {
            headers: { 'X-Employee-ID': id },
            httpsAgent, // Use optimized agent
          }).then(res => ({ id, students: res.data.students || [] })).catch(() => ({ id, students: [] }))
        )
      );
      
      const found = results.find(res => 
        res.students.find(s => s.hikvision_id === externalId || s.id.toString() === externalId)
      );
      
      if (found) {
        StudentsService.teacherCache.set(externalId, found.id);
        return found.id;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async getExternalAttendance(id: number, dateStr?: string) {
    const student = await this.studentsRepository.findOne({ where: { id } });
    if (!student || !student.externalId) {
      return { recent_attendance: [] };
    }

    const targetDateStr = dateStr || new Date().toISOString().split('T')[0];
    const targetYear = parseInt(targetDateStr.slice(0, 4));
    const targetMonth = parseInt(targetDateStr.slice(5, 7));
    
    // Calculate proper month range for SQL
    const monthStart = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const nextMonth = targetMonth === 12 ? 1 : targetMonth + 1;
    const nextYear = targetMonth === 12 ? targetYear + 1 : targetYear;
    const monthEndBoundary = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    try {
      // 1. Check local cache first
      const cached = await this.attendanceRecordRepo.createQueryBuilder('ar')
        .where('ar.externalId = :extId', { extId: student.externalId })
        .andWhere('ar.date >= :start AND ar.date < :end', { start: monthStart, end: monthEndBoundary })
        .getMany();

      if (cached.length > 0) {
        return {
          recent_attendance: cached.map(rec => ({
            date: typeof rec.date === 'string' ? rec.date : new Date(rec.date).toISOString().split('T')[0],
            status: rec.status,
            status_display: rec.status === 'present' ? 'Kelgan' : 'Kelmagan',
            arrived_at: rec.arrivedAt,
            left_at: rec.leftAt
          })),
          fromCache: true
        };
      }

      // 2. Fallback to external API
      // Try to find the correct classroom/employee ID for this student
      const employeeId = await this.findCorrectEmployeeID(student.externalId, targetDateStr) || '1';
      
      const url = `https://schoolmanage.uz/api/student/${student.externalId}/?date=${targetDateStr}&page_size=100`;
      console.log(`[Attendance] Fetching: ${url} with Employee-ID: ${employeeId}`);
      
      const response = await axios.get(url, {
        headers: { 'X-Employee-ID': employeeId },
        httpsAgent,
      });

      const records = response.data.results?.attendance || response.data.recent_attendance || [];
      const targetYearStr = String(targetYear);
      const targetMonthStr = String(targetMonth).padStart(2, '0');

      if (records.length > 0) {
        console.log(`[Attendance] Sample record from API: ${JSON.stringify(records[0])}`);
      }

      // Filter and save to cache (Using string comparison to avoid UTC/Local timezone shifts on server)
      const filteredRecords = records.filter(rec => {
        if (!rec.date || typeof rec.date !== 'string') return false;
        // Handle both YYYY-MM-DD and DD.MM.YYYY if necessary, but keep it robust
        return rec.date.includes(`${targetYearStr}-${targetMonthStr}`) || rec.date.includes(`.${targetMonthStr}.${targetYearStr}`);
      });

      console.log(`[Attendance] Found ${records.length} total, ${filteredRecords.length} filtered for ${targetYearStr}-${targetMonthStr}`);

      for (const rec of filteredRecords) {
        const status = rec.status?.toLowerCase() === 'present' ? 'present' : 'absent';
        const arrTime = rec.arrived_at && rec.arrived_at !== 'None' && rec.arrived_at !== '0' ? rec.arrived_at : null;
        const depTime = rec.left_at && rec.left_at !== 'None' && rec.left_at !== '0' ? rec.left_at : null;

        await this.attendanceRecordRepo.upsert({
          externalId: student.externalId,
          date: rec.date.split('T')[0], // Ensure clean YYYY-MM-DD
          status,
          arrivedAt: arrTime,
          leftAt: depTime,
        }, ['externalId', 'date']);
      }

      return {
        recent_attendance: filteredRecords.map(rec => ({
          ...rec,
          status_display: rec.status?.toLowerCase() === 'present' ? 'Kelgan' : 'Kelmagan'
        })),
        fromCache: false
      };
    } catch (e) {
      console.error(`Error fetching student attendance for ${student.name}:`, e.message);
      return { recent_attendance: [] };
    }
  }

  async create(student: Partial<Student>): Promise<Student> {
    return this.studentsRepository.save(student);
  }

  async remove(id: number): Promise<void> {
    await this.studentsRepository.delete(id);
  }

  async deleteAll(): Promise<void> {
    try {
      await this.studentsRepository.query('TRUNCATE TABLE "student" RESTART IDENTITY CASCADE');
      console.log('Talabalar jadvali muvaffaqiyatli tozalandi.');
    } catch (error) {
      console.error('Tozalashda xatolik:', error.message);
      // Agar "student" o'xshamasa, katta harf bilan urinib ko'ramiz
      try {
        await this.studentsRepository.query('TRUNCATE TABLE "Student" RESTART IDENTITY CASCADE');
        console.log('Talabalar jadvali (Student) muvaffaqiyatli tozalandi.');
      } catch (err2) {
        throw new Error('Jadvalni tozalab bo\'lmadi: ' + err2.message);
      }
    }
  }

  async syncFromExternalApi() {
    const response = await axios.get('https://schoolmanage.uz/api/students/all/?school_id=1');
    const { students } = response.data;

    for (const extStudent of students) {
      const extId = extStudent.id.toString();
      
      // Try to find existing student by externalId
      let student = await this.studentsRepository.findOne({ 
        where: { externalId: extId } 
      });

      if (!student) {
        student = this.studentsRepository.create({ externalId: extId });
        console.log(`Yangi o'quvchi qo'shilmoqda: ${extStudent.full_name}`);
      } else {
        console.log(`Mavjud o'quvchi yangilanmoqda: ${extStudent.full_name}`);
      }

      // Map fields (Upsert)
      student.name = extStudent.full_name;
      student.schoolName = extStudent.school_name;
      student.classroom = extStudent.classroom;
      student.parentName = extStudent.parent_name;
      student.parentPhone = extStudent.parent_phone;
      student.photo = extStudent.photo;
      student.isActive = true;

      await this.studentsRepository.save(student);
    }

    return { message: `${students.length} ta o'quvchi muvaffaqiyatli sinxronizatsiya qilindi.` };
  }
}
