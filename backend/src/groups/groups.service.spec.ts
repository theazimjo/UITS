import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Field } from './entities/field.entity';
import { Course } from './entities/course.entity';
import { Room } from './entities/room.entity';
import { Enrollment } from './entities/enrollment.entity';
import { GroupPhase } from './entities/group-phase.entity';
import { Student } from '../students/entities/student.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Staff } from '../staff/entities/staff.entity';
import { GroupStatus } from './enums/group-status.enum';

describe('GroupsService', () => {
  let service: GroupsService;
  let groupRepo: any;
  let phaseRepo: any;

  const mockGroup = {
    id: 1,
    name: 'Test Group',
    status: GroupStatus.ACTIVE,
    teacher: { id: 1 },
    course: { id: 1 },
    phases: []
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: getRepositoryToken(Group), useValue: { find: jest.fn(), findOne: jest.fn().mockResolvedValue(mockGroup), save: jest.fn(g => g), query: jest.fn() } },
        { provide: getRepositoryToken(Field), useValue: {} },
        { provide: getRepositoryToken(Course), useValue: {} },
        { provide: getRepositoryToken(Room), useValue: {} },
        { provide: getRepositoryToken(Enrollment), useValue: { findOne: jest.fn(), save: jest.fn(e => e), create: jest.fn(e => e) } },
        { provide: getRepositoryToken(GroupPhase), useValue: { findOne: jest.fn().mockResolvedValue({ id: 1, startDate: '2026-03-01', endDate: null }), save: jest.fn(p => p), create: jest.fn(p => p) } },
        { provide: getRepositoryToken(Student), useValue: {} },
        { provide: getRepositoryToken(Payment), useValue: { delete: jest.fn() } },
        { provide: getRepositoryToken(Staff), useValue: { delete: jest.fn() } },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    groupRepo = module.get(getRepositoryToken(Group));
    phaseRepo = module.get(getRepositoryToken(GroupPhase));
  });

  it('should transfer group and close old phase', async () => {
    const transferData = { teacherId: 2, courseId: 2, startDate: '2026-04-01' };

    const result = await service.transferGroup(1, transferData);

    // Check if new phase created
    expect(phaseRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      teacher: { id: 2 },
      startDate: '2026-04-01'
    }));

    // Check if old phase ended
    expect(phaseRepo.save).toHaveBeenCalled();

    // Check if group teacher updated
    expect(result.teacher.id).toBe(2);
  });

  it('should complete group correctly', async () => {
    // Set mock to return completed group for all findOne calls in this test
    groupRepo.findOne.mockResolvedValue({ 
      ...mockGroup, 
      status: GroupStatus.COMPLETED,
      endDate: '2026-04-30'
    });
    
    const result = await service.completeGroup(1, '2026-04-30');
    expect(result!.status).toBe(GroupStatus.COMPLETED);
    expect(result!.endDate).toBe('2026-04-30');
  });
});
