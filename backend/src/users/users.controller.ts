import { Controller, Patch, Get, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() updateDto: any) {
    const userId = req.user.userId;
    return this.usersService.update(userId, {
      name: updateDto.name,
      username: updateDto.username,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async updatePassword(@Req() req: any, @Body() passwordDto: any) {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi!');
    }

    const isMatch = await bcrypt.compare(passwordDto.oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Eski parol xato!');
    }

    const hashedNewPassword = await bcrypt.hash(passwordDto.newPassword, 10);
    return this.usersService.update(userId, { password: hashedNewPassword });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    const { password, ...result } = user;
    return result;
  }
}
