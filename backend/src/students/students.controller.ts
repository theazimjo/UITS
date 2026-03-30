import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(): Promise<Student[]> {
    return this.studentsService.findAll();
  }

  @Post('sync')
  async sync() {
    return this.studentsService.syncFromExternalApi();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Student | null> {
    if (isNaN(+id)) return Promise.resolve(null);
    return this.studentsService.findOne(+id);
  }

  @Post()
  create(@Body() student: Partial<Student>): Promise<Student> {
    return this.studentsService.create(student);
  }

  @Delete('all/clear')
  deleteAll() {
    return this.studentsService.deleteAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    if (isNaN(+id)) return Promise.resolve();
    return this.studentsService.remove(+id);
  }
}
