import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilterStudentDto } from './dto/filter-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async findAll(@Query() query: FilterStudentDto) {
    return this.studentsService.findAll(query);
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

  @Get(':id/attendance')
  getAttendance(@Param('id') id: string, @Query('date') date?: string) {
    if (isNaN(+id)) return { recent_attendance: [] };
    return this.studentsService.getExternalAttendance(+id, date);
  }

  @Post(':id')
  async update(@Param('id') id: string, @Body() data: UpdateStudentDto) {
    if (isNaN(+id)) return null;
    return this.studentsService.update(+id, data);
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
