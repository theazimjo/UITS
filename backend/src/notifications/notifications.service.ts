import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Enrollment } from '../groups/entities/enrollment.entity';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) { }

  async sendBulk(data: { studentIds: number[]; title: string; message: string }, senderId?: number, senderRole?: string) {
    const { studentIds, title, message } = data;

    if (senderRole === 'teacher' && senderId) {
      // Validate that all students are in groups taught by this teacher
      const teacherEnrollments = await this.enrollmentRepo.find({
        where: {
          student: { id: In(studentIds) },
          group: { teacherId: senderId }
        },
        relations: ['group', 'student']
      });

      const authorizedStudentIds = new Set(teacherEnrollments.map(e => e.student.id));
      const unauthorizedIds = studentIds.filter(id => !authorizedStudentIds.has(id));

      if (unauthorizedIds.length > 0) {
        throw new UnauthorizedException(`Siz ID ${unauthorizedIds.join(', ')} bo'lgan o'quvchilarga xabar yubora olmaysiz.`);
      }
    }

    // Create notification entries for each student
    const notifications = studentIds.map(sid => {
      return this.notificationRepo.create({
        studentId: sid,
        title,
        message
      });
    });

    return this.notificationRepo.save(notifications);
  }

  async findForParent(parentPhone: string) {
    // 1. Find all children (students) for this parent
    const children = await this.studentRepo.find({
      where: { parentPhone },
      select: ['id']
    });

    if (children.length === 0) return [];

    const studentIds = children.map(c => c.id);

    // 2. Fetch notifications for these student IDs
    return this.notificationRepo.find({
      where: { studentId: In(studentIds) },
      order: { createdAt: 'DESC' }
    });
  }

  async markAsRead(id: number) {
    const n = await this.notificationRepo.findOne({ where: { id } });
    if (!n) throw new NotFoundException('Bildirishnoma topilmadi');
    n.isRead = true;
    return this.notificationRepo.save(n);
  }
}
