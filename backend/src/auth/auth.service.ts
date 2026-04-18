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
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    console.log(`[Auth] Attempt: ${username}`);

    // 1. Check Admin User
    const user = await this.usersService.findOne(username);
    if (user) {
      const isMatch = await bcrypt.compare(pass, user.password);
      console.log(`[Auth] Admin found: ${username}, match: ${isMatch}`);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }

    // 2. Check Staff (Teacher)
    const staff = await this.staffRepository.findOne({ where: { username } });
    if (staff) {
      const isMatch = staff.password && await bcrypt.compare(pass, staff.password);
      console.log(`[Auth] Staff found: ${username}, match: ${!!isMatch}`);
      if (isMatch) {
        const { password, ...result } = staff;
        return { ...result, role: 'teacher' };
      }
    }

    // 3. Check Parent (Login = Phone, Password = ExternalID)
    const students = await this.studentRepository.find({
      where: { parentPhone: username }
    });

    if (students.length > 0) {
      const matchingStudent = students.find(s => s.externalId === pass);
      console.log(`[Auth] Parent check for ${username}: total children found=${students.length}, match=${!!matchingStudent}`);

      if (matchingStudent) {
        return {
          id: matchingStudent.id,
          username: matchingStudent.parentPhone,
          role: 'parent',
          name: matchingStudent.parentName
        };
      }
    }

    console.log(`[Auth] Login failed for ${username}`);
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
