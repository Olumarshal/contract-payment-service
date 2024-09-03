import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './job.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { Contract, ContractStatus } from '../contract/entities/contract.entity';
import { Profile } from '../profile/entities/profile.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { mock, MockProxy } from 'jest-mock-extended';

describe('JobsService', () => {
  let service: JobsService;
  let jobRepository: MockProxy<Repository<Job>>;
  let contractRepository: MockProxy<Repository<Contract>>;
  let profileRepository: MockProxy<Repository<Profile>>;

  beforeEach(async () => {
    jobRepository = mock<Repository<Job>>();
    contractRepository = mock<Repository<Contract>>();
    profileRepository = mock<Repository<Profile>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: getRepositoryToken(Job), useValue: jobRepository },
        { provide: getRepositoryToken(Contract), useValue: contractRepository },
        { provide: getRepositoryToken(Profile), useValue: profileRepository },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUnpaidJobs', () => {
    it('should return a list of unpaid jobs', async () => {
      const profile = new Profile();
      const job = new Job();
      job.isPaid = false;
      job.contract = new Contract();
      job.contract.status = ContractStatus.IN_PROGRESS;
      job.contract.client = profile;

      jobRepository.find.mockResolvedValue([job]);

      const result = await service.getUnpaidJobs(profile);
      expect(result).toEqual([job]);
      expect(jobRepository.find).toHaveBeenCalledWith({
        where: {
          isPaid: false,
          contract: { status: ContractStatus.IN_PROGRESS, client: profile },
        },
        relations: ['contract'],
      });
    });
  });

  describe('payForJob', () => {
    it('should pay for a job successfully', async () => {
      const profile = new Profile();
      profile.id = 1;
      profile.balance = 1000;

      const contractor = new Profile();
      contractor.id = 2;
      contractor.balance = 0;

      const contract = new Contract();
      contract.client = profile;
      contract.contractor = contractor;

      const job = new Job();
      job.id = 1;
      job.price = 500;
      job.isPaid = false;
      job.contract = contract;

      jobRepository.findOne.mockResolvedValue(job);
      profileRepository.save.mockResolvedValue(profile);
      contractRepository.save.mockResolvedValue(contract);
      jobRepository.save.mockResolvedValue(job);

      const result = await service.payForJob(job.id, profile);

      expect(result).toBe(job);
      expect(job.isPaid).toBe(true);
      expect(job.paidDate).toBeDefined();
      expect(profile.balance).toBe(500);
      expect(contract.contractor.balance).toBe(500);
      expect(jobRepository.save).toHaveBeenCalledWith(job);
      expect(contractRepository.save).toHaveBeenCalledWith(contract);
    });

    it('should throw NotFoundException if job is not found', async () => {
      jobRepository.findOne.mockResolvedValue(null);

      await expect(service.payForJob(1, new Profile())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if contract or client is not found', async () => {
      const job = new Job();
      job.id = 1;
      job.contract = null;

      jobRepository.findOne.mockResolvedValue(job);

      await expect(service.payForJob(1, new Profile())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if job is already paid', async () => {
      const profile = new Profile();
      profile.id = 1;

      const job = new Job();
      job.id = 1;
      job.isPaid = true;
      job.contract = new Contract();
      job.contract.client = profile;

      jobRepository.findOne.mockResolvedValue(job);

      await expect(service.payForJob(job.id, profile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if insufficient balance', async () => {
      const profile = new Profile();
      profile.id = 1;
      profile.balance = 100;

      const contractor = new Profile();
      contractor.id = 2;

      const contract = new Contract();
      contract.client = profile;
      contract.contractor = contractor;

      const job = new Job();
      job.id = 1;
      job.price = 500;
      job.isPaid = false;
      job.contract = contract;

      jobRepository.findOne.mockResolvedValue(job);

      await expect(service.payForJob(job.id, profile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('depositBalance', () => {
    it('should deposit balance successfully', async () => {
      const profile = new Profile();
      profile.id = 1;
      profile.balance = 0;

      const job = new Job();
      job.price = 400;
      job.isPaid = false;
      job.contract = new Contract();
      job.contract.client = profile;
      job.contract.status = ContractStatus.IN_PROGRESS;

      profileRepository.findOne.mockResolvedValue(profile);
      jobRepository.find.mockResolvedValue([job]);
      profileRepository.save.mockResolvedValue(profile);

      const result = await service.depositBalance(1, 100);

      expect(result).toBe(profile);
      expect(profile.balance).toBe(100);
      expect(profileRepository.save).toHaveBeenCalledWith(profile);
    });

    it('should throw NotFoundException if client not found', async () => {
      profileRepository.findOne.mockResolvedValue(null);

      await expect(service.depositBalance(1, 100)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if deposit exceeds limit', async () => {
      const profile = new Profile();
      profile.id = 1;
      profile.balance = 0;

      const job = new Job();
      job.price = 400;
      job.isPaid = false;
      job.contract = new Contract();
      job.contract.client = profile;
      job.contract.status = ContractStatus.IN_PROGRESS;

      profileRepository.findOne.mockResolvedValue(profile);
      jobRepository.find.mockResolvedValue([job]);

      await expect(service.depositBalance(1, 200)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
