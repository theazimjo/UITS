import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Payment } from '../payments/entities/payment.entity';
import { StaffPayment } from '../staff/entities/staff-payment.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, StaffPayment, Expense])
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
