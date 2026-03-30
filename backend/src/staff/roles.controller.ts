import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  @Get()
  findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  @Post()
  create(@Body() role: Partial<Role>): Promise<Role> {
    return this.roleRepository.save(role);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.roleRepository.delete(+id).then(() => {});
  }
}
