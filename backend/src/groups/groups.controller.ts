import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch, BadRequestException } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAllGroups() { return this.groupsService.findAllGroups(); }


  @Get('fields')
  findAllFields() { return this.groupsService.findAllFields(); }

  @Post('fields')
  createField(@Body() data: any) { return this.groupsService.createField(data); }

  @Patch('fields/:id')
  updateField(@Param('id') id: string, @Body() data: any) { 
    if (isNaN(+id)) return null;
    return this.groupsService.updateField(+id, data); 
  }

  @Delete('fields/:id')
  deleteField(@Param('id') id: string) { 
    if (isNaN(+id)) return null;
    return this.groupsService.deleteField(+id); 
  }

  @Get('courses')
  findAllCourses() { return this.groupsService.findAllCourses(); }

  @Post('courses')
  createCourse(@Body() data: any) { return this.groupsService.createCourse(data); }

  @Patch('courses/:id')
  updateCourse(@Param('id') id: string, @Body() data: any) { 
    if (isNaN(+id)) return null;
    return this.groupsService.updateCourse(+id, data); 
  }

  @Delete('courses/:id')
  deleteCourse(@Param('id') id: string) { 
    if (isNaN(+id)) return null;
    return this.groupsService.deleteCourse(+id); 
  }

  @Get('rooms')
  findAllRooms() { return this.groupsService.findAllRooms(); }

  @Post('rooms')
  createRoom(@Body() data: any) { return this.groupsService.createRoom(data); }

  @Patch('rooms/:id')
  updateRoom(@Param('id') id: string, @Body() data: any) { 
    if (isNaN(+id)) return null;
    return this.groupsService.updateRoom(+id, data); 
  }

  @Delete('rooms/:id')
  deleteRoom(@Param('id') id: string) { 
    if (isNaN(+id)) return null;
    return this.groupsService.deleteRoom(+id); 
  }

  // Generic group routes - Must be at the bottom to avoid conflicts with static routes above
  @Get(':id')
  findOneGroup(@Param('id') id: string) { 
    if (isNaN(+id)) return null;
    return this.groupsService.findOneGroup(+id); 
  }

  @Post()
  createGroup(@Body() data: any) { return this.groupsService.createGroup(data); }

  @Delete(':id')
  deleteGroup(@Param('id') id: string) { 
    if (isNaN(+id)) return null;
    return this.groupsService.deleteGroup(+id); 
  }

  @Patch(':id')
  updateGroup(@Param('id') id: string, @Body() data: any) { 
    if (isNaN(+id)) return null;
    return this.groupsService.updateGroup(+id, data); 
  }

  @Post(':id/enroll/:studentId')
  enrollStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    if (isNaN(+id) || isNaN(+studentId)) throw new BadRequestException('Invalid ID');
    return this.groupsService.enrollStudent(+id, +studentId);
  }

  @Delete(':id/unenroll/:studentId')
  unenrollStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    if (isNaN(+id) || isNaN(+studentId)) throw new BadRequestException('Invalid ID');
    return this.groupsService.unenrollStudent(+id, +studentId);
  }
}
