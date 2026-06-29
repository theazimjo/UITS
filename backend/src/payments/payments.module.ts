import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Group } from '../groups/entities/group.entity';
import { GroupPhase } from '../groups/entities/group-phase.entity';
import { Enrollment } from '../groups/entities/enrollment.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Group, GroupPhase, Enrollment]),
    ActivityLogModule,
    NotificationsModule
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
