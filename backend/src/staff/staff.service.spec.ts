import { Test, TestingModule } from '@nestjs/testing';
import { StaffService } from './staff.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { NotFoundException } from '@nestjs/common';

describe('StaffService', () => {
  let service: StaffService;
  let repo: any;

  const mockStaff = {
    id: 1,
    name: 'Test Teacher',
    salaryType: 'KPI',
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
        phases: [
          {
            teacherId: 1,
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
          },
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
    repo = module.get(getRepositoryToken(Staff));
  });

  it('should calculate KPI salary correctly', async () => {
    const result = await service.calculateSalary(1, '2026-03');
    
    // 2 active students * (200,000 * 50 / 100) = 200,000
    // KPI type doesn't include fixedAmount by default in this implementation?
    // Wait, let's check the service code logic. 
    // In service: let totalSalary = Number(staff.fixedAmount) || 0; 
    // then if KPI: totalSalary += kpiSalary.
    
    expect(result.totalSalary).toBe(1200000); // 1,000,000 + 200,000
    expect(result.groupBreakdown[0].students).toBe(2);
  });

  it('should handle staff with no groups', async () => {
    repo.findOne.mockResolvedValueOnce({ ...mockStaff, groups: [] });
    const result = await service.calculateSalary(1, '2026-03');
    expect(result.totalSalary).toBe(1000000);
  });

  it('should throw NotFoundException if staff missing', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.calculateSalary(999, '2026-03')).rejects.toThrow(NotFoundException);
  });
});
