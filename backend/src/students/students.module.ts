import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, AttendanceRecord])],
  providers: [StudentsService],
  controllers: [StudentsController],
})
export class StudentsModule {}
