import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
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
import { ActivityLogService } from '../activity-log/activity-log.service';

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
    private readonly activityLogService: ActivityLogService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Initialization and legacy migrations moved to InitialMigrationService
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
      relations: [
        'course', 'room', 'teacher', 'course.field', 
        'enrollments', 'enrollments.student', 
        'phases', 'phases.teacher', 'phases.course'
      ] 
    }); 
  }
  async findOneGroup(id: number) { 
    return this.groupRepo.findOne({ 
      where: { id }, 
      relations: [
        'course', 'room', 'teacher', 'course.field', 
        'enrollments', 'enrollments.student', 
        'phases', 'phases.teacher', 'phases.course'
      ] 
    }); 
  }
  async createGroup(data: any): Promise<Group | null> { 
    const group = new Group();
    Object.assign(group, data);
    if (data.courseId) group.courseId = data.courseId;
    if (data.roomId) group.roomId = data.roomId;
    if (data.teacherId) group.teacherId = data.teacherId;
    
    const g = await this.groupRepo.save(group); 

    if (g.teacherId && g.courseId) {
      const phase = this.phaseRepo.create({
        group: { id: g.id },
        teacherId: g.teacherId,
        courseId: g.courseId,
        startDate: g.startDate || new Date().toISOString().split('T')[0]
      });
      await this.phaseRepo.save(phase);
    }

    await this.activityLogService.logAction({ action: 'GROUP_CREATE', entityName: 'GROUP', entityId: g.id, description: `Yangi "${g.name}" guruhi yaratildi.` });
    return this.findOneGroup(g.id);
  }

  async updateGroup(id: number, data: any): Promise<Group | null> { 
    const group = await this.groupRepo.findOne({ 
      where: { id },
      relations: ['phases']
    });
    if (!group) return null;
    
    // Explicitly update IDs if provided in data and nullify relations to force TypeORM to use new IDs
    // Also use Number() to ensure we don't pass empty strings or NaN to the DB
    const tId = data.teacherId ? Number(data.teacherId) : NaN;
    if (!isNaN(tId) && tId !== group.teacherId) {
      group.teacherId = tId;
      group.teacher = null as any; 

      const activePhase = group.phases?.find(p => !p.endDate);
      if (activePhase) {
        activePhase.teacherId = group.teacherId;
        await this.phaseRepo.save(activePhase).catch(e => console.error('Phase update fail:', e));
      }
    }

    const cId = data.courseId ? Number(data.courseId) : NaN;
    if (!isNaN(cId) && cId !== group.courseId) {
      group.courseId = cId;
      group.course = null as any;

      const activePhase = group.phases?.find(p => !p.endDate);
      if (activePhase) {
        activePhase.courseId = group.courseId;
        await this.phaseRepo.save(activePhase).catch(e => console.error('Phase course update fail:', e));
      }
    }

    const rId = data.roomId ? Number(data.roomId) : NaN;
    if (!isNaN(rId) && rId !== group.roomId) {
      group.roomId = rId;
      group.room = null as any;
    }
    
    // Clean up dates - PostgreSQL doesn't like empty strings for date columns
    if (data.startDate === '') data.startDate = null;
    if (data.endDate === '') data.endDate = null;

    const { teacherId, courseId, roomId, teacher, course, room, phases, ...rest } = data;
    Object.assign(group, rest);
    
    await this.groupRepo.save(group);
    
    await this.activityLogService.logAction({ action: 'GROUP_EDIT', entityName: 'GROUP', entityId: id, description: `Guruh parametrlari tahrirlandi.` });
    return this.findOneGroup(id);
  }
  async deleteGroup(id: number) { 
    // Clear legacy many-to-many join table if it exists
    await this.groupRepo.query('DELETE FROM "group_students_student" WHERE "groupId" = $1', [id]).catch(() => {});
    // Clear other potential legacy tables
    await this.groupRepo.query('DELETE FROM "group_timeline" WHERE "groupId" = $1', [id]).catch(() => {});
    
    // Perform standard delete (related entities with cascades like Payment, Enrollment, GroupPhase will be handled by DB)
    await this.groupRepo.delete(id); 
    await this.activityLogService.logAction({ action: 'GROUP_DELETE', entityName: 'GROUP', entityId: id, description: `ID ${id} bo'lgan guruh butunlay o'chirildi.` });
  }

  async enrollStudent(groupId: number, studentId: number, joinedDateStr?: string) {
    const joinedDate = joinedDateStr ? new Date(joinedDateStr) : new Date();
    const existing = await this.enrollmentRepo.findOne({
      where: { group: { id: groupId }, student: { id: studentId } },
      relations: ['student']
    });
    if (existing) {
      if (existing.status !== EnrollmentStatus.ACTIVE) {
        existing.status = EnrollmentStatus.ACTIVE;
        existing.joinedDate = joinedDate;
        return this.enrollmentRepo.save(existing);
      }
      return existing;
    }
    const newEnrollment = this.enrollmentRepo.create({
      group: { id: groupId },
      student: { id: studentId },
      status: EnrollmentStatus.ACTIVE,
      joinedDate: joinedDate
    });
    const saved = await this.enrollmentRepo.save(newEnrollment);
    const st = await this.studentRepo.findOne({ where: { id: studentId } });
    await this.activityLogService.logAction({ action: 'STUDENT_ENROLL', entityName: 'GROUP', entityId: groupId, description: `Talaba "${st?.name || 'ID '+studentId}" guruhga biriktirildi.` });
    return saved;
  }

  async enrollMultipleStudents(groupId: number, studentIds: number[], joinedDateStr?: string) {
    const results: any[] = [];
    for (const studentId of studentIds) {
      if (studentId && !isNaN(studentId)) {
        results.push(await this.enrollStudent(groupId, studentId, joinedDateStr));
      }
    }
    await this.activityLogService.logAction({ action: 'STUDENT_ENROLL_MULTIPLE', entityName: 'GROUP', entityId: groupId, description: `${results.length} ta o'quvchilar guruhga ommaviy biriktirildi.` });
    return results;
  }

  async unenrollStudent(groupId: number, studentId: number) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { group: { id: groupId }, student: { id: studentId } }
    });
    if (enrollment) {
      enrollment.status = EnrollmentStatus.DROPPED;
      const st = await this.studentRepo.findOne({ where: { id: studentId } });
      await this.activityLogService.logAction({ action: 'STUDENT_UNENROLL', entityName: 'GROUP', entityId: groupId, description: `Talaba "${st?.name || 'ID '+studentId}" guruhdan chetlashtirildi (Status DROPPED).` });
      return this.enrollmentRepo.save(enrollment);
    }
  }

  async updateEnrollmentStatus(groupId: number, studentId: number, status: EnrollmentStatus) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { group: { id: groupId }, student: { id: studentId } }
    });
    if (!enrollment) throw new Error('Enrollment not found');
    enrollment.status = status;
    const st = await this.studentRepo.findOne({ where: { id: studentId } });
    await this.activityLogService.logAction({ action: 'STUDENT_STATUS_EDIT', entityName: 'GROUP', entityId: groupId, description: `Talaba "${st?.name || 'ID '+studentId}" holati "${status}" ga o'zgartirildi.` });
    return this.enrollmentRepo.save(enrollment);
  }

  async transferGroup(id: number, data: { teacherId: number, courseId: number, startDate: string, endDate: string }) {
    return this.dataSource.transaction(async (manager) => {
      const group = await manager.findOne(Group, { where: { id } });
      if (!group) throw new Error('Group not found');

      const currentPhase = await manager.findOne(GroupPhase, {
        where: { group: { id }, endDate: IsNull() }
      });

      if (currentPhase && data.startDate) {
        try {
          const newStart = new Date(data.startDate);
          if (!isNaN(newStart.getTime())) {
            const prevEnd = new Date(newStart);
            prevEnd.setDate(prevEnd.getDate() - 1);
            currentPhase.endDate = prevEnd.toISOString().split('T')[0];
            await manager.save(GroupPhase, currentPhase);
          }
        } catch (e) {
          console.error('Phase end date calculation fail:', e);
        }
      }

      const tId = Number(data.teacherId);
      const cId = Number(data.courseId);

      const newPhase = manager.create(GroupPhase, {
        group: { id },
        teacherId: !isNaN(tId) ? tId : undefined,
        courseId: !isNaN(cId) ? cId : undefined,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
      });
      await manager.save(GroupPhase, newPhase);

      // Explicitly update IDs and nullify relations to force TypeORM to use new IDs
      if (!isNaN(tId)) {
        group.teacherId = tId;
        group.teacher = null as any; 
      }
      
      if (!isNaN(cId)) {
        group.courseId = cId;
        group.course = null as any;
      }

      if (data.startDate) group.startDate = data.startDate;
      if (data.endDate === '') group.endDate = null as any;
      else if (data.endDate) group.endDate = data.endDate;

      await manager.save(Group, group);

      // LOG HISTORY
      await this.activityLogService.logAction({
        action: 'GROUP_TRANSFER',
        entityName: 'GROUP',
        entityId: id,
        description: `Guruh boshqa o'qituvchi/yo'nalishga o'tkazildi.`,
        details: {
          teacherId: data.teacherId,
          courseId: data.courseId,
          startDate: data.startDate
        }
      });

      return this.findOneGroup(id);
    });
  }

  async completeGroup(id: number, endDate: string) {
    return this.dataSource.transaction(async (manager) => {
      await manager.update(Group, id, {
        status: GroupStatus.COMPLETED,
        endDate: endDate
      });

      // Close current phase
      const currentPhase = await manager.findOne(GroupPhase, {
        where: { group: { id }, endDate: IsNull() }
      });
      if (currentPhase) {
        currentPhase.endDate = endDate;
        await manager.save(GroupPhase, currentPhase);
      }

      // Update all ACTIVE enrollments to GRADUATED
      await manager.update(Enrollment, 
        { group: { id }, status: EnrollmentStatus.ACTIVE }, 
        { status: EnrollmentStatus.GRADUATED }
      );

      // LOG HISTORY
      await this.activityLogService.logAction({
        action: 'GROUP_COMPLETE',
        entityName: 'GROUP',
        entityId: id,
        description: `Guruh faoliyati yakunlandi.`,
        details: { endDate }
      });

      return this.findOneGroup(id);
    });
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
        try {
          // Double quotes for identifiers containing uppercase or reserved words
          await this.groupRepo.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
          console.log(`Cleared ${table}`);
        } catch (e) {
          console.warn(`Could not clear ${table}: ${e.message}`);
        }
      }
      
      console.log('--- SYSTEM DATA CLEARED SUCCESSFULLY ---');
      return { message: 'All data effectively cleared' };
    } catch (err) {
      console.error('CRITICAL CLEAR FAIL:', err.message);
      throw err;
    }
  }

  async getActivitiesForGroup(groupId: number) {
    return this.activityLogService.findByEntity('GROUP', groupId);
  }
}
