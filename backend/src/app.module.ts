import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { StaffModule } from './staff/staff.module';
import { GroupsModule } from './groups/groups.module';
import { User } from './users/entities/user.entity';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '2255',
      database: process.env.DB_NAME || 'crm_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    StaffModule,
    GroupsModule,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    // BIR MARTALIK TOZALASH (Dublikatlarni yo'qotish uchun)
    // await this.usersService.clearStudents(); // Agar kerak bo'lsa buni ishlating
    
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
