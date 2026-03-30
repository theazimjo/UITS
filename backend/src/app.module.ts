import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
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
      synchronize: true, // Should be false in production
    }),
    StudentsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    const adminUser = await this.usersService.findOne('admin');
    if (!adminUser) {
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
