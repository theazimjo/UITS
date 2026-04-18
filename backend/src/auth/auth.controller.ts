import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    if (!loginDto.username || !loginDto.password) {
      throw new UnauthorizedException('Login va parol kiritilishi shart!');
    }
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Kiritilgan ma\'lumotlar xato!');
    }
    return this.authService.login(user);
  }
}
