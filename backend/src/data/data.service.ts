import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Group } from '../groups/entities/group.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Income } from '../incomes/entities/income.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Field } from '../groups/entities/field.entity';
import { Course } from '../groups/entities/course.entity';
import { Room } from '../groups/entities/room.entity';
import { Enrollment } from '../groups/entities/enrollment.entity';
import { Notification } from '../notifications/entities/notification.entity';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Student) private readonly studentRepository: Repository<Student>,
    @InjectRepository(Staff) private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Group) private readonly groupRepository: Repository<Group>,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Income) private readonly incomeRepository: Repository<Income>,
    @InjectRepository(Expense) private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Field) private readonly fieldRepository: Repository<Field>,
    @InjectRepository(Course) private readonly courseRepository: Repository<Course>,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(Enrollment) private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
  ) {}

  async exportAll() {
    const data = {
      users: await this.userRepository.find(),
      students: await this.studentRepository.find(),
      staff: await this.staffRepository.find(),
      groups: await this.groupRepository.find(),
      payments: await this.paymentRepository.find(),
      incomes: await this.incomeRepository.find(),
      expenses: await this.expenseRepository.find(),
      fields: await this.fieldRepository.find(),
      courses: await this.courseRepository.find(),
      rooms: await this.roomRepository.find(),
      enrollments: await this.enrollmentRepository.find(),
      notifications: await this.notificationRepository.find(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    // Remove sensitive data from users before export
    data.users = data.users.map(u => {
      const { password, ...rest } = u;
      return rest as any;
    });

    return data;
  }
}
