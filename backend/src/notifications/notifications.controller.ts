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
  @Roles('admin', 'manager', 'teacher')
  async sendBulk(@Body() data: { studentIds: number[]; title: string; message: string }, @Request() req) {
    const senderId = req.user.userId;
    const senderRole = req.user.role;
    return this.notificationsService.sendBulk(data, senderId, senderRole);
  }

  @Get('parent')
  @Roles('parent')
  async getForParent(@Request() req) {
    const parentPhone = req.user.username; // Usually username is phone for parents
    return this.notificationsService.findForParent(parentPhone);
  }

  @Get('me')
  @Roles('admin', 'manager', 'teacher', 'parent')
  async getForMe(@Request() req) {
    const role = req.user.role;
    if (role === 'parent') {
      const parentPhone = req.user.username;
      return this.notificationsService.findForParent(parentPhone);
    } else if (role === 'admin' || role === 'manager') {
      return this.notificationsService.findAllForAdmin();
    } else {
      const username = req.user.username;
      return this.notificationsService.findForStaffByUsername(username);
    }
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(Number(id));
  }
}
