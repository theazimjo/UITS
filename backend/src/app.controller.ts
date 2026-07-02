import { Controller, Get, Post, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('system')
export class AppController {
  constructor(private readonly appService: AppService) {}

  private static isMaintenance = false;

  @Get('status')
  getStatus() {
    return { maintenance: AppController.isMaintenance };
  }

  @Post('maintenance/start')
  startMaintenance(@Headers('authorization') authHeader: string) {
    this.verifyToken(authHeader);
    AppController.isMaintenance = true;
    console.log('🚧 [Maintenance] Started successfully.');
    return { success: true, maintenance: true };
  }

  @Post('maintenance/end')
  endMaintenance(@Headers('authorization') authHeader: string) {
    this.verifyToken(authHeader);
    AppController.isMaintenance = false;
    console.log('✅ [Maintenance] Ended successfully.');
    return { success: true, maintenance: false };
  }

  private verifyToken(authHeader: string) {
    if (!authHeader) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
    if (token !== secret) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
