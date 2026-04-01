import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Field } from './entities/field.entity';
import { Course } from './entities/course.entity';
import { Room } from './entities/room.entity';
import { Group } from './entities/group.entity';
import { Enrollment } from './entities/enrollment.entity';
import { GroupStatus } from './enums/group-status.enum';
import { EnrollmentStatus } from './enums/enrollment-status.enum';
import { GroupPhase } from './entities/group-phase.entity';
import { Student } from '../students/entities/student.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Staff } from '../staff/entities/staff.entity';

@Injectable()
export class GroupsService implements OnModuleInit {
  constructor(
    @InjectRepository(Field) private readonly fieldRepo: Repository<Field>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Room) private readonly roomRepo: Repository<Room>,
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(GroupPhase) private readonly phaseRepo: Repository<GroupPhase>,
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
  ) {}

  async onModuleInit() {
    try {
      // One-time migration: ManyToMany -> Enrollment
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
      
      // Phase Migration
      const groups = await this.groupRepo.find({ relations: ['phases', 'teacher', 'course'] });
      for (const group of groups) {
        if (!group.phases || group.phases.length === 0) {
          const initialPhase = this.phaseRepo.create({
            group: { id: group.id },
            teacher: { id: group.teacher?.id },
            course: { id: group.course?.id },
            startDate: group.startDate,
          });
          await this.phaseRepo.save(initialPhase);
        }
      }
    } catch (err) {
      // console.warn('Migration skipped or failed:', err.message);
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
      relations: ['course', 'room', 'teacher', 'course.field', 'enrollments', 'enrollments.student', 'phases'] 
    }); 
  }
  async createGroup(data: Partial<Group>) { return this.groupRepo.save(data); }
  async updateGroup(id: number, data: Partial<Group>) { 
    await this.groupRepo.update(id, data); 
    return this.findOneGroup(id);
  }
  async deleteGroup(id: number) { await this.groupRepo.delete(id); }

  async enrollStudent(groupId: number, studentId: number) {
    const existing = await this.enrollmentRepo.findOne({
      where: { group: { id: groupId }, student: { id: studentId } },
      relations: ['student']
    });
    if (existing) {
      if (existing.status !== EnrollmentStatus.ACTIVE) {
        existing.status = EnrollmentStatus.ACTIVE;
        existing.joinedDate = new Date();
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

  async transferGroup(id: number, data: { teacherId: number, courseId: number, startDate: string }) {
    const group = await this.findOneGroup(id);
    if (!group) throw new Error('Group not found');
    const currentPhase = await this.phaseRepo.findOne({
      where: { group: { id }, endDate: IsNull() }
    });
    if (currentPhase) {
      const newStart = new Date(data.startDate);
      const prevEnd = new Date(newStart);
      prevEnd.setDate(prevEnd.getDate() - 1);
      currentPhase.endDate = prevEnd.toISOString().split('T')[0];
      await this.phaseRepo.save(currentPhase);
    }
    const newPhase = this.phaseRepo.create({
      group: { id },
      teacher: { id: data.teacherId },
      course: { id: data.courseId },
      startDate: data.startDate,
    });
    await this.phaseRepo.save(newPhase);
    group.teacher = { id: data.teacherId } as any;
    group.course = { id: data.courseId } as any;
    group.startDate = data.startDate;
    return this.groupRepo.save(group);
  }

  async completeGroup(id: number, endDate: string) {
    const group = await this.groupRepo.findOne({ 
      where: { id },
      relations: ['enrollments']
    });
    if (!group) throw new Error('Group not found');
    group.status = GroupStatus.COMPLETED;
    group.endDate = endDate;
    await this.groupRepo.save(group);
    return this.findOneGroup(id);
  }

  async clearAllData() {
    console.log('--- CLEAR ALL DATA V5 START ---');
    console.warn('--- CLEARING ALL SYSTEM DATA (CASCADE) ---');
    try {
      // TRUNCATE is much more robust for clearing entire tables
      const tables = [
        'payment', 'enrollment', 'group_phase', 'group', 
        'student', 'staff', 'course', 'room', 'field',
        'group_students_student'
      ];
      
      for (const table of tables) {
        await this.groupRepo.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
      }
      
      console.log('--- SYSTEM DATA CLEARED SUCCESSFULLY ---');
      return { success: true, message: 'All data cleared' };
    } catch (err) {
      console.error('FAILED TO CLEAR DATA:', err);
      throw err;
    }
  }
}
