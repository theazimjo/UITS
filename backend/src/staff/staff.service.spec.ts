import { Test, TestingModule } from '@nestjs/testing';
import { StaffService } from './staff.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { StaffPayment } from './entities/staff-payment.entity';
import { MonthlyReport } from './entities/monthly-report.entity';
import { ReportDate } from './entities/report-date.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException } from '@nestjs/common';

describe('StaffService', () => {
  let service: StaffService;
  let repo: any;

  const mockStaff = {
    id: 1,
    name: 'Test Teacher',
    salaryType: 'MIXED',
    fixedAmount: 1000000,
    kpiPercentage: 50,
    groups: [
      {
        id: 1,
        name: 'Group 1',
        course: { monthlyPrice: 200000 },
        enrollments: [
          { status: 'ACTIVE' },
          { status: 'ACTIVE' },
          { status: 'DROPPED' }
        ],
        payments: [
          {
            amount: 400000,
            month: '2026-03',
            teacher: { id: 1 }
          }
        ],
        phases: [
          {
            teacherId: 1,
            teacher: { id: 1 },
            startDate: '2026-03-01',
            endDate: null
          }
        ]
      }
    ]
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: getRepositoryToken(Staff),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn().mockResolvedValue(mockStaff),
            save: jest.fn(),
            delete: jest.fn(),
            manager: {
              find: jest.fn().mockResolvedValue(mockStaff.groups)
            }
          },
        },
        {
          provide: getRepositoryToken(StaffPayment),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MonthlyReport),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ReportDate),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ActivityLogService,
          useValue: {
            logAction: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendToStaff: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
    repo = module.get(getRepositoryToken(Staff));
  });

  it('should calculate KPI salary correctly', async () => {
    const result = await service.calculateSalary(1, '2026-03');
    
    // Group has payment of 400,000 in 2026-03 and teacher is teaching (isStaffTeaching=true)
    // ALL payments for the group are counted: 400,000
    // MIXED salary: fixedAmount (1,000,000) + KPI (400,000 * 50% = 200,000) = 1,200,000
    expect(result.total).toBe(1200000);
    expect(result.revenue).toBe(400000);
    expect(result.breakdown[0].studentCount).toBe(2);
  });

  it('should handle staff with no groups', async () => {
    repo.findOne.mockResolvedValueOnce({ ...mockStaff, groups: [] });
    repo.manager.find.mockResolvedValueOnce([]);
    // When there are no groups, salary is just fixedAmount (1,000,000)
    const result = await service.calculateSalary(1, '2026-03');
    expect(result.total).toBe(1000000);
    expect(result.revenue).toBe(0);
  });

  it('should throw NotFoundException if staff missing', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.calculateSalary(999, '2026-03')).rejects.toThrow(NotFoundException);
  });
});
