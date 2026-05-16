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
import { Role } from '../staff/entities/role.entity';

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
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async exportAll() {
    const data = {
      roles: await this.roleRepository.find(),
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

  // Id larni saqlab qolgan holda ma'lumotlarni kiritish va ketma-ketlikni (sequence) to'g'rilash
  private async savePreservingIds(repo: Repository<any>, tableName: string, items: any[]) {
    if (!items || items.length === 0) return;
    for (const item of items) {
      try {
        // Ob'yekt ko'rinishidagi bog'liqliklarni (relation) faqat ID raqamga aylantiramiz
        // Masalan: { teacher: { id: 2 } } -> { teacher: 2 }
        const insertItem = { ...item };
        for (const key in insertItem) {
          if (insertItem[key] !== null && typeof insertItem[key] === 'object' && !Array.isArray(insertItem[key])) {
            if (insertItem[key].id !== undefined) {
              insertItem[key] = insertItem[key].id;
            }
          }
        }
        await repo.createQueryBuilder().insert().values(insertItem).execute();
      } catch (e) {
        // Agar ID allaqachon mavjud bo'lsa (yoki boshqa xato), shunchaki yangilaymiz (update)
        await repo.save(item);
      }
    }
    // Postgres uchun ID ketma-ketligini (sequence) to'g'rilab qo'yamiz, 
    // aks holda yangi ma'lumot qo'shganda ID conflict bo'ladi
    try {
      await repo.query(`SELECT setval('${tableName}_id_seq', COALESCE((SELECT MAX(id)+1 FROM "${tableName}"), 1), false)`);
    } catch (e) {}
  }

  async importData(data: any) {
    // Eng kam bog'liqlikdan ko'proq bog'liqlikga qarab saqlaymiz

    // Role jadvalini oldindan asosiy rollar bilan to'ldiramiz (Bazada yo'q bo'lsa xato bermasligi uchun)
    await this.roleRepository.save([
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Teacher' },
      { id: 3, name: 'Manager' },
      { id: 4, name: 'Staff' }
    ]);

    let roles = data.roles || [];
    if (roles.length > 0) {
      await this.roleRepository.save(roles);
    }

    if (data.users) await this.savePreservingIds(this.userRepository, 'user', data.users);
    if (data.fields) await this.savePreservingIds(this.fieldRepository, 'field', data.fields);
    if (data.rooms) await this.savePreservingIds(this.roomRepository, 'room', data.rooms);
    if (data.staff) await this.savePreservingIds(this.staffRepository, 'staff', data.staff);
    
    if (data.courses) await this.savePreservingIds(this.courseRepository, 'course', data.courses);
    if (data.students) await this.savePreservingIds(this.studentRepository, 'student', data.students);
    
    if (data.groups) await this.savePreservingIds(this.groupRepository, 'group', data.groups);
    
    if (data.enrollments) await this.savePreservingIds(this.enrollmentRepository, 'enrollment', data.enrollments);
    if (data.payments) await this.savePreservingIds(this.paymentRepository, 'payment', data.payments);
    if (data.incomes) await this.savePreservingIds(this.incomeRepository, 'income', data.incomes);
    if (data.expenses) await this.savePreservingIds(this.expenseRepository, 'expense', data.expenses);
    if (data.notifications) await this.savePreservingIds(this.notificationRepository, 'notification', data.notifications);

    return { success: true, message: 'Data imported successfully' };
  }
}
