import { Controller, Get, Post, Body, Param, Delete, UseGuards, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('test-status/check')
  test() {
    return { status: 'Payments module is active' };
  }

  @Post()
  create(@Body() data: any) {
    return this.paymentsService.create(data);
  }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('group/:id')
  findByGroup(@Param('id') id: string) {
    if (isNaN(+id)) throw new BadRequestException('Invalid group ID');
    return this.paymentsService.findByGroup(+id);
  }

  @Get('student/:studentId/group/:groupId')
  findByStudentAndGroup(@Param('studentId') studentId: string, @Param('groupId') groupId: string) {
    if (isNaN(+studentId) || isNaN(+groupId)) throw new BadRequestException('Invalid IDs');
    return this.paymentsService.findByStudentAndGroup(+studentId, +groupId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    if (isNaN(+id)) throw new BadRequestException('Invalid ID');
    return this.paymentsService.remove(+id);
  }
}
