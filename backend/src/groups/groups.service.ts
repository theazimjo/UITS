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
  async findAllGroups() { return this.groupRepo.find({ relations: ['course', 'room', 'teacher', 'course.field', 'students'] }); }
  async findOneGroup(id: number) { return this.groupRepo.findOne({ where: { id }, relations: ['course', 'room', 'teacher', 'course.field', 'students'] }); }
  async createGroup(data: Partial<Group>) { return this.groupRepo.save(data); }
  async updateGroup(id: number, data: Partial<Group>) { await this.groupRepo.update(id, data); return this.groupRepo.findOne({ where: { id }, relations: ['course', 'room', 'teacher', 'course.field', 'students'] }); }
  async deleteGroup(id: number) { await this.groupRepo.delete(id); }

  async enrollStudent(groupId: number, studentId: number) {
    const group = await this.groupRepo.findOne({ where: { id: groupId }, relations: ['students'] });
    if (!group) throw new Error('Group not found');
    
    // Simple way to add to many-to-many
    // Note: In real app, we should use StudentRepo to find the student first
    const student = { id: studentId } as any; 
    group.students = [...(group.students || []), student];
    return this.groupRepo.save(group);
  }

  async unenrollStudent(groupId: number, studentId: number) {
    const group = await this.groupRepo.findOne({ where: { id: groupId }, relations: ['students'] });
    if (!group) throw new Error('Group not found');
    
    group.students = (group.students || []).filter(s => s.id !== studentId);
    return this.groupRepo.save(group);
  }
}
