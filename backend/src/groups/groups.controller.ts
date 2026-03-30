import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAllGroups() { return this.groupsService.findAllGroups(); }

  @Post()
  createGroup(@Body() data: any) { return this.groupsService.createGroup(data); }

  @Delete(':id')
  deleteGroup(@Param('id') id: string) { return this.groupsService.deleteGroup(+id); }

  @Patch(':id')
  updateGroup(@Param('id') id: string, @Body() data: any) { return this.groupsService.updateGroup(+id, data); }

  @Get('fields')
  findAllFields() { return this.groupsService.findAllFields(); }

  @Post('fields')
  createField(@Body() data: any) { return this.groupsService.createField(data); }

  @Patch('fields/:id')
  updateField(@Param('id') id: string, @Body() data: any) { return this.groupsService.updateField(+id, data); }

  @Delete('fields/:id')
  deleteField(@Param('id') id: string) { return this.groupsService.deleteField(+id); }

  @Get('courses')
  findAllCourses() { return this.groupsService.findAllCourses(); }

  @Post('courses')
  createCourse(@Body() data: any) { return this.groupsService.createCourse(data); }

  @Patch('courses/:id')
  updateCourse(@Param('id') id: string, @Body() data: any) { return this.groupsService.updateCourse(+id, data); }

  @Delete('courses/:id')
  deleteCourse(@Param('id') id: string) { return this.groupsService.deleteCourse(+id); }

  @Get('rooms')
  findAllRooms() { return this.groupsService.findAllRooms(); }

  @Post('rooms')
  createRoom(@Body() data: any) { return this.groupsService.createRoom(data); }

  @Patch('rooms/:id')
  updateRoom(@Param('id') id: string, @Body() data: any) { return this.groupsService.updateRoom(+id, data); }

  @Delete('rooms/:id')
  deleteRoom(@Param('id') id: string) { return this.groupsService.deleteRoom(+id); }
}
