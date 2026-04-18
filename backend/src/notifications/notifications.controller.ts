import { Controller, Post, Get, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @Roles('admin', 'manager')
  async sendBulk(@Body() data: { studentIds: number[]; title: string; message: string }) {
    return this.notificationsService.sendBulk(data);
  }

  @Get('parent')
  @Roles('parent')
  async getForParent(@Request() req) {
    const parentPhone = req.user.username; // Usually username is phone for parents
    return this.notificationsService.findForParent(parentPhone);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(Number(id));
  }
}
