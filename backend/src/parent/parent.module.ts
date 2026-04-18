import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentController } from './parent.controller';
import { Student } from '../students/entities/student.entity';
import { StudentsModule } from '../students/students.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    StudentsModule,
    PaymentsModule,
  ],
  controllers: [ParentController],
})
export class ParentModule {}
