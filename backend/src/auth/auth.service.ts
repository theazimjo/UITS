import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../staff/entities/staff.entity';
import { Student } from '../students/entities/student.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    // 1. Check Admin User
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    // 2. Check Staff (Teacher)
    const staff = await this.staffRepository.findOne({ where: { username } });
    if (staff && staff.password && await bcrypt.compare(pass, staff.password)) {
      const { password, ...result } = staff;
      return { ...result, role: 'teacher' };
    }

    // 3. Check Parent (Login = Phone, Password = ExternalID)
    const student = await this.studentRepository.findOne({ 
      where: { parentPhone: username } 
    });
    // For MVP, we use externalId as a plaintext/direct password for parents
    if (student && student.externalId === pass) {
      return { 
        id: student.id, 
        username: student.parentPhone, 
        role: 'parent',
        name: student.parentName 
      };
    }

    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}
