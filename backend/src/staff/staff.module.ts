import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Role } from './entities/role.entity';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { RolesController } from './roles.controller';
import { TeacherController } from './teacher.controller';
import { StaffPayment } from './entities/staff-payment.entity';
import { Group } from '../groups/entities/group.entity';
import { Enrollment } from '../groups/entities/enrollment.entity';
import { Payment } from '../payments/entities/payment.entity';
import { GroupPhase } from '../groups/entities/group-phase.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Staff,
      Role,
      StaffPayment,
      Group,
      Enrollment,
      Payment,
      GroupPhase,
    ]),
  ],
  providers: [StaffService],
  controllers: [StaffController, RolesController, TeacherController],
  exports: [StaffService],
})
export class StaffModule {}
