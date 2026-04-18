import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomesService } from './incomes.service';
import { IncomesController } from './incomes.controller';
import { Income } from './entities/income.entity';

import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Income]),
    ActivityLogModule
  ],
  controllers: [IncomesController],
  providers: [IncomesService],
  exports: [TypeOrmModule, IncomesService], // Exporting service too for good measure
})
export class IncomesModule {}
