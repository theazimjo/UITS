import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Field } from './entities/field.entity';
import { Course } from './entities/course.entity';
import { Room } from './entities/room.entity';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Field) private readonly fieldRepo: Repository<Field>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Room) private readonly roomRepo: Repository<Room>,
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
  ) {}

  // Fields
  async findAllFields() { return this.fieldRepo.find(); }
  async createField(data: Partial<Field>) { return this.fieldRepo.save(data); }
  async updateField(id: number, data: Partial<Field>) { await this.fieldRepo.update(id, data); return this.fieldRepo.findOne({ where: { id } }); }
  async deleteField(id: number) { await this.fieldRepo.delete(id); }

  // Courses
  async findAllCourses() { return this.courseRepo.find({ relations: ['field'] }); }
  async createCourse(data: Partial<Course>) { return this.courseRepo.save(data); }
  async updateCourse(id: number, data: Partial<Course>) { await this.courseRepo.update(id, data); return this.courseRepo.findOne({ where: { id } }); }
  async deleteCourse(id: number) { await this.courseRepo.delete(id); }

  // Rooms
  async findAllRooms() { return this.roomRepo.find(); }
  async createRoom(data: Partial<Room>) { return this.roomRepo.save(data); }
  async updateRoom(id: number, data: Partial<Room>) { await this.roomRepo.update(id, data); return this.roomRepo.findOne({ where: { id } }); }
  async deleteRoom(id: number) { await this.roomRepo.delete(id); }

  // Groups
  async findAllGroups() { return this.groupRepo.find({ relations: ['course', 'room', 'teacher', 'course.field'] }); }
  async createGroup(data: Partial<Group>) { return this.groupRepo.save(data); }
  async updateGroup(id: number, data: Partial<Group>) { await this.groupRepo.update(id, data); return this.groupRepo.findOne({ where: { id } }); }
  async deleteGroup(id: number) { await this.groupRepo.delete(id); }
}
