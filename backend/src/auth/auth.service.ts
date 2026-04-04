import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../staff/entities/staff.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
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
