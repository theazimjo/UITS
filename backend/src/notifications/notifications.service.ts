import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { Student } from '../students/entities/student.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  async sendBulk(data: { studentIds: number[]; title: string; message: string }) {
    const { studentIds, title, message } = data;
    
    // Create notification entries for each student
    const notifications = studentIds.map(sid => {
      const notification = new Notification();
      notification.studentId = sid;
      notification.title = title;
      notification.message = message;
      return notification;
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
