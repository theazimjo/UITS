import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import axios from 'axios';
import * as https from 'https';

// Optimized agent for high-concurrency parallel requests (31 days)
const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 100, // Allow 100 concurrent sockets
  maxFreeSockets: 10,
  timeout: 60000,
});

@Injectable()
export class StudentsService {
  // In-memory cache for student to teacher (classroom) mapping
  // Map<externalId, employeeId>
  private static teacherCache = new Map<string, string>();

  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async onApplicationBootstrap() {
    const tables = await this.studentsRepository.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    );
    console.log('Mavjud jadvallar:', tables.map((t) => t.table_name).join(', '));
  }

  async findAll(): Promise<Student[]> {
    return this.studentsRepository.find({ relations: ['enrollments', 'enrollments.group'] });
  }

  async findOne(id: number): Promise<Student | null> {
    return this.studentsRepository.findOne({ where: { id }, relations: ['enrollments', 'enrollments.group'] });
  }

  private async findCorrectEmployeeID(externalId: string): Promise<string | null> {
    // 1. Check persistent in-memory cache first
    if (StudentsService.teacherCache.has(externalId)) {
      return StudentsService.teacherCache.get(externalId) || null;
    }

    const today = new Date().toISOString().split('T')[0];
    const ids = ['1', '2', '3', '4', '5'];
    
    try {
      const results = await Promise.all(
        ids.map(id => 
          axios.get(`https://schoolmanage.uz/api/teacher/classroom/?date=${today}`, {
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

    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    const employeeId = await this.findCorrectEmployeeID(student.externalId);
    
    if (!employeeId) {
      return { recent_attendance: [] };
    }

    // Fetch all days of the month in parallel using massive socket pool
    const lastDay = new Date(year, month + 1, 0).getDate();
    const attendancePromises: Promise<{ date: string; data: any }>[] = [];

    for (let day = 1; day <= lastDay; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      attendancePromises.push(
        axios.get(`https://schoolmanage.uz/api/teacher/classroom/?date=${date}`, {
          headers: { 'X-Employee-ID': employeeId },
          httpsAgent, // MaxSockets: 100
        }).then(res => ({ date, data: res.data })).catch(() => ({ date, data: null }))
      );
    }

    const results = await Promise.all(attendancePromises);
    const recent_attendance = results.map(res => {
      const dayData = res.data?.students?.find(s => s.hikvision_id === student.externalId || s.id.toString() === student.externalId);
      if (dayData) {
        return {
          date: res.date,
          status: dayData.today_status,
          status_display: dayData.today_status === 'present' ? 'Kelgan' : 'Kelmagan',
          arrived_at: dayData.arrived_at,
          left_at: dayData.left_at
        };
      }
      return null;
    }).filter(Boolean);

    return { recent_attendance };
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
