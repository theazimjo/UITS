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

  async findAll(): Promise<Student[]> {
    return this.studentsRepository.find();
  }

  async findOne(id: number): Promise<Student | null> {
    return this.studentsRepository.findOne({ where: { id } });
  }

  async create(student: Partial<Student>): Promise<Student> {
    return this.studentsRepository.save(student);
  }

  async remove(id: number): Promise<void> {
    await this.studentsRepository.delete(id);
  }

  async syncFromExternalApi() {
    const response = await axios.get('https://schoolmanage.uz/api/students/all/?school_id=1');
    const { students } = response.data;

    for (const extStudent of students) {
      // Find if student already exists by hikvision_id (externalId)
      let student = await this.studentsRepository.findOne({ 
        where: { externalId: extStudent.hikvision_id } 
      });

      if (!student) {
        student = new Student();
      }

      // Map fields
      student.name = extStudent.full_name;
      student.externalId = extStudent.hikvision_id;
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
