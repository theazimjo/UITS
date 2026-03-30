import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  findAll(): Promise<Student[]> {
    return this.studentsRepository.find();
  }

  findOne(id: number): Promise<Student | null> {
    return this.studentsRepository.findOneBy({ id });
  }

  create(student: Partial<Student>): Promise<Student> {
    const newStudent = this.studentsRepository.create(student);
    return this.studentsRepository.save(newStudent);
  }

  async remove(id: number): Promise<void> {
    await this.studentsRepository.delete(id);
  }
}
