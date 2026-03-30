import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { StaffModule } from './staff/staff.module';
import { User } from './users/entities/user.entity';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '2255',
      database: 'crm_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    StaffModule,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    const admin = await this.usersService.findOne('admin');
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.usersService.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Default admin user created: admin / admin123');
    }
  }
}
