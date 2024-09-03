import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../job/entities/job.entity';
import { Profile } from '../profile/entities/profile.entity';

describe('AdminService', () => {
  let service: AdminService;
  let jobRepository: Repository<Job>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let profileRepository: Repository<Profile>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Job),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Profile),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
    profileRepository = module.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBestProfession', () => {
    it('should return the best profession with total earnings', async () => {
      const mockResult = {
        profession: 'Software Developer',
        totalEarnings: 1000,
      };

      jest.spyOn(jobRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockResult),
      } as any);

      const result = await service.getBestProfession(
        '2023-01-01',
        '2023-12-31',
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getBestClients', () => {
    it('should return the best clients with total paid amounts', async () => {
      const mockResult = [
        { clientId: 1, totalPaid: 500 },
        { clientId: 2, totalPaid: 300 },
      ];

      jest.spyOn(jobRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockResult),
      } as any);

      const result = await service.getBestClients(
        '2023-01-01',
        '2023-12-31',
        2,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
