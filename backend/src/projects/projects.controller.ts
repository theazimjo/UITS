import { Controller, Post, Get, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ProjectsService } from './projects.service';

@Controller('project-items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @Roles('admin', 'manager', 'teacher')
  async getAll() {
    return this.projectsService.findAll();
  }

  @Post()
  @Roles('admin', 'manager', 'teacher')
  async create(
    @Body() data: { type: string; content: string; page: string },
    @Request() req
  ) {
    const creatorName = req.user.username;
    const creatorRole = req.user.role;
    return this.projectsService.create(data, creatorName, creatorRole);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'teacher')
  async update(
    @Param('id') id: string,
    @Body() updateData: { status?: string; replyMessage?: string }
  ) {
    return this.projectsService.update(Number(id), updateData);
  }
}
