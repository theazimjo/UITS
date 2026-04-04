import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Expense } from './entities/expense.entity';

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @Roles('admin')
  findAll() {
    return this.expensesService.findAll();
  }

  @Post()
  @Roles('admin')
  create(@Body() data: any) {
    return this.expensesService.create(data);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() data: any) {
    return this.expensesService.update(+id, data);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(+id);
  }
}
