import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Role } from './entities/role.entity';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { RolesController } from './roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, Role])],
  providers: [StaffService],
  controllers: [StaffController, RolesController],
  exports: [StaffService],
})
export class StaffModule {}
