import { Controller, Get, UseGuards, Request, Param, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { StudentsService } from '../students/students.service';
import { PaymentsService } from '../payments/payments.service';

@Controller('parent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('parent')
export class ParentController {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly studentsService: StudentsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Get('children')
  async getChildren(@Request() req) {
    const parentPhone = req.user.username; // From AuthService validateUser
    return this.studentRepo.find({
      where: { parentPhone },
      relations: ['enrollments', 'enrollments.group']
    });
  }

  @Get('child/:id/attendance')
  async getAttendance(@Param('id') id: string, @Request() req) {
    await this.verifyAccess(Number(id), req.user.username);
    return this.studentsService.getExternalAttendance(Number(id));
  }

  @Get('child/:id/exams')
  async getExams(@Param('id') id: string, @Request() req) {
    await this.verifyAccess(Number(id), req.user.username);
    return this.studentsService.findExams(Number(id));
  }

  @Get('child/:id/payments')
  async getPayments(@Param('id') id: string, @Request() req) {
    await this.verifyAccess(Number(id), req.user.username);
    return this.paymentsService.findByStudent(Number(id));
  }

  private async verifyAccess(studentId: number, parentPhone: string) {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student || student.parentPhone !== parentPhone) {
      throw new ForbiddenException('Siz ushbu o\'quvchi ma\'lumotlarini ko\'ra olmaysiz');
    }
  }
}
