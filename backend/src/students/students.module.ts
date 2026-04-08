import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { Grade } from './entities/grade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, AttendanceRecord, Grade])],
  providers: [StudentsService],
  controllers: [StudentsController],
})
export class StudentsModule {}
