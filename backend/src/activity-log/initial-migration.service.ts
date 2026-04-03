import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { Enrollment } from '../groups/entities/enrollment.entity';
import { GroupPhase } from '../groups/entities/group-phase.entity';
import { EnrollmentStatus } from '../groups/enums/enrollment-status.enum';

@Injectable()
export class InitialMigrationService implements OnModuleInit {
  private readonly logger = new Logger(InitialMigrationService.name);

  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(GroupPhase) private readonly phaseRepo: Repository<GroupPhase>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting background data initialization checks...');
    try {
      await this.syncForeignKeys();
      await this.migrateLegacyEnrollments();
      await this.ensureGroupPhases();
      this.logger.log('Initialization checks completed.');
    } catch (err) {
      this.logger.error('Background migration failed:', err.stack);
    }
  }

  private async syncForeignKeys() {
    // Force Foreign Key ON DELETE CASCADE sync for Payment table if not already set
    const sql = `
      ALTER TABLE "payment" DROP CONSTRAINT IF EXISTS "FK_029cd43ebfef4fe4fc82dee659d";
      ALTER TABLE "payment" ADD CONSTRAINT "FK_029cd43ebfef4fe4fc82dee659d" 
        FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE;
    `;
    await this.dataSource.query(sql).catch(err => this.logger.warn('FK sync failed (might already exist):', err.message));
  }

  private async migrateLegacyEnrollments() {
    // Check if legacy many-to-many table exists
    const checkTable = await this.dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'group_students_student'
      );
    `);

    if (checkTable[0].exists) {
      const data = await this.dataSource.query('SELECT * FROM group_students_student');
      if (data.length > 0) {
        this.logger.log(`Migrating ${data.length} legacy enrollments...`);
        for (const row of data) {
          const exists = await this.enrollmentRepo.findOne({
            where: { group: { id: row.groupId }, student: { id: row.studentId } }
          });
          if (!exists) {
            await this.enrollmentRepo.save({
              group: { id: row.groupId },
              student: { id: row.studentId },
              status: EnrollmentStatus.ACTIVE
            });
          }
        }
      }
    }
  }

  private async ensureGroupPhases() {
    const groups = await this.groupRepo.find({ relations: ['phases', 'teacher', 'course'] });
    let patchCount = 0;
    for (const group of groups) {
      if (!group.phases || group.phases.length === 0) {
        const initialPhase = this.phaseRepo.create({
          group: { id: group.id },
          teacher: { id: group.teacher?.id },
          course: { id: group.course?.id },
          startDate: group.startDate,
        });
        await this.phaseRepo.save(initialPhase);
        patchCount++;
      }
    }
    if (patchCount > 0) {
      this.logger.log(`Patched ${patchCount} groups with missing initial phases.`);
    }
  }
}
