import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './job.controller';
import { JobsService } from './job.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
// import { Profile } from 'src/profile/entities/profile.entity';

describe('JobsController', () => {
  let controller: JobsController;
  let service: JobsService;

  const mockJobsService = {
    getUnpaidJobs: jest.fn(),
    payForJob: jest.fn(),
    depositBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [{ provide: JobsService, useValue: mockJobsService }],
    }).compile();

    controller = module.get<JobsController>(JobsController);
    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUnpaidJobs', () => {
    it('should call getUnpaidJobs method from JobsService', async () => {
      const req = { profile: { id: 1 } };
      await controller.getUnpaidJobs(req as any);

      expect(service.getUnpaidJobs).toHaveBeenCalledWith(req.profile);
    });
  });

  describe('payForJob', () => {
    it('should call payForJob method from JobsService', async () => {
      const jobId = 1;
      const req = { profile: { id: 1 } };
      await controller.payForJob(jobId, req as any);

      expect(service.payForJob).toHaveBeenCalledWith(jobId, req.profile);
    });

    it('should throw NotFoundException if job is not found', async () => {
      (service.payForJob as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );
      const jobId = 1;
      const req = { profile: { id: 1 } };

      await expect(controller.payForJob(jobId, req as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if job is already paid', async () => {
      (service.payForJob as jest.Mock).mockRejectedValueOnce(
        new BadRequestException('Job is already paid'),
      );
      const jobId = 1;
      const req = { profile: { id: 1 } };

      await expect(controller.payForJob(jobId, req as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('depositBalance', () => {
    it('should call depositBalance method from JobsService', async () => {
      const userId = 1;
      const amount = 100;
      await controller.depositBalance(userId, amount);

      expect(service.depositBalance).toHaveBeenCalledWith(userId, amount);
    });

    it('should throw NotFoundException if client is not found', async () => {
      (service.depositBalance as jest.Mock).mockRejectedValueOnce(
        new NotFoundException('Client not found'),
      );
      const userId = 1;
      const amount = 100;

      await expect(controller.depositBalance(userId, amount)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if deposit amount is invalid', async () => {
      (service.depositBalance as jest.Mock).mockRejectedValueOnce(
        new BadRequestException('Invalid deposit amount'),
      );
      const userId = 1;
      const amount = 1000;

      await expect(controller.depositBalance(userId, amount)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
