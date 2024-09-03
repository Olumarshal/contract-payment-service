/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from '../profile/entities/profile.entity';
import { Contract } from '../contract/entities/contract.entity';
import { Job } from '../job/entities/job.entity';
import { Repository } from 'typeorm';

describe('SeedService', () => {
  let service: SeedService;
  let profileRepository: Repository<Profile>;
  let contractRepository: Repository<Contract>;
  let jobRepository: Repository<Job>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: getRepositoryToken(Profile),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Contract),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Job),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    profileRepository = module.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
    contractRepository = module.get<Repository<Contract>>(
      getRepositoryToken(Contract),
    );
    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
