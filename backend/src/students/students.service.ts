import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import axios from 'axios';

@Injectable()
export class StudentsService {
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
