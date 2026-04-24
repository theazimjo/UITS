import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Payment } from '../payments/entities/payment.entity';
import { StaffPayment } from '../staff/entities/staff-payment.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Income } from '../incomes/entities/income.entity';
import { IncomesModule } from '../incomes/incomes.module';

import { FinanceCategory } from './entities/finance-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, StaffPayment, Expense, Income, FinanceCategory]),
    IncomesModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
