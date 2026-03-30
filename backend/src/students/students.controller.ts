import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(): Promise<Student[]> {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Student | null> {
    return this.studentsService.findOne(+id);
  }

  @Post()
  create(@Body() student: Partial<Student>): Promise<Student> {
    return this.studentsService.create(student);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.studentsService.remove(+id);
  }
}
