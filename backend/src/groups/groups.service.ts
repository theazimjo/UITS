import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Field } from './entities/field.entity';
import { Course } from './entities/course.entity';
import { Room } from './entities/room.entity';
import { Group } from './entities/group.entity';
import { Enrollment } from './entities/enrollment.entity';
import { GroupStatus } from './enums/group-status.enum';
import { EnrollmentStatus } from './enums/enrollment-status.enum';

@Injectable()
export class GroupsService implements OnModuleInit {
  constructor(
    @InjectRepository(Field) private readonly fieldRepo: Repository<Field>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Room) private readonly roomRepo: Repository<Room>,
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async onModuleInit() {
    try {
      // One-time migration: ManyToMany -> Enrollment
      // Check if old join table exists and has data
      const checkTable = await this.groupRepo.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'group_students_student'
        );
      `);

      if (checkTable[0].exists) {
        const data = await this.groupRepo.query('SELECT * FROM group_students_student');
        if (data.length > 0) {
          console.log(`Migrating ${data.length} enrollments...`);
          for (const row of data) {
            const exists = await this.enrollmentRepo.findOne({
              where: { 
                group: { id: row.groupId }, 
                student: { id: row.studentId } 
              }
            });
            if (!exists) {
              await this.enrollmentRepo.save({
                group: { id: row.groupId },
                student: { id: row.studentId },
                status: EnrollmentStatus.ACTIVE
              });
            }
          }
          console.log('Migration completed.');
        }
      }
    } catch (err) {
      console.warn('Migration skipped or failed (table might be gone):', err.message);
    }
  }

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
  async findAllGroups() { 
    return this.groupRepo.find({ 
      relations: ['course', 'room', 'teacher', 'course.field', 'enrollments', 'enrollments.student'] 
    }); 
  }
  async findOneGroup(id: number) { 
    return this.groupRepo.findOne({ 
      where: { id }, 
      relations: ['course', 'room', 'teacher', 'course.field', 'enrollments', 'enrollments.student'] 
    }); 
  }
  async createGroup(data: Partial<Group>) { return this.groupRepo.save(data); }
  async updateGroup(id: number, data: Partial<Group>) { 
    await this.groupRepo.update(id, data); 
    return this.findOneGroup(id);
  }
  async deleteGroup(id: number) { await this.groupRepo.delete(id); }

  async enrollStudent(groupId: number, studentId: number) {
    // Check if enrollment already exists (even if DROPPED)
    const existing = await this.enrollmentRepo.findOne({
      where: { 
        group: { id: groupId }, 
        student: { id: studentId } 
      },
      relations: ['student']
    });

    if (existing) {
      if (existing.status !== EnrollmentStatus.ACTIVE) {
        existing.status = EnrollmentStatus.ACTIVE;
        existing.joinedDate = new Date(); // Reset joined date to now
        return this.enrollmentRepo.save(existing);
      }
      return existing;
    }

    const newEnrollment = this.enrollmentRepo.create({
      group: { id: groupId },
      student: { id: studentId },
      status: EnrollmentStatus.ACTIVE,
      joinedDate: new Date()
    });

    return this.enrollmentRepo.save(newEnrollment);
  }

  async unenrollStudent(groupId: number, studentId: number) {
    // Repurposed to mark as DROPPED instead of hard delete
    const enrollment = await this.enrollmentRepo.findOne({
      where: { group: { id: groupId }, student: { id: studentId } }
    });
    if (enrollment) {
      enrollment.status = EnrollmentStatus.DROPPED;
      return this.enrollmentRepo.save(enrollment);
    }
  }

  async updateEnrollmentStatus(groupId: number, studentId: number, status: EnrollmentStatus) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { group: { id: groupId }, student: { id: studentId } }
    });
    if (!enrollment) throw new Error('Enrollment not found');
    enrollment.status = status;
    return this.enrollmentRepo.save(enrollment);
  }

  async completeGroup(id: number, endDate: string) {
    const group = await this.groupRepo.findOne({ 
      where: { id },
      relations: ['enrollments']
    });
    if (!group) throw new Error('Group not found');

    // Update group status and end date
    group.status = GroupStatus.COMPLETED;
    group.endDate = endDate;
    await this.groupRepo.save(group);

    return this.findOneGroup(id);
  }
}
