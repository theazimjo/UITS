import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Group } from '../groups/entities/group.entity';
import { Enrollment } from '../groups/entities/enrollment.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Student } from '../students/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, Enrollment, Payment, Student]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
