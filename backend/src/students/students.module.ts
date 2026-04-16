import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { Grade } from './entities/grade.entity';
import { Exam } from '../staff/entities/exam.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, AttendanceRecord, Grade, Exam])],
  providers: [StudentsService],
  controllers: [StudentsController],
})
export class StudentsModule {}
