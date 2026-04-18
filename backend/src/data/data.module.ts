import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataService } from './data.service';
import { DataController } from './data.controller';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, Student, Staff, Group, Payment, Income, Expense, 
      Field, Course, Room, Enrollment, Notification
    ]),
  ],
  providers: [DataService],
  controllers: [DataController],
})
export class DataModule {}
