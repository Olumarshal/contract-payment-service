import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { Contract, ContractStatus } from '../contract/entities/contract.entity';
import { Profile } from '../profile/entities/profile.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getUnpaidJobs(profile: Profile): Promise<Job[]> {
    return this.jobRepository.find({
      where: {
        isPaid: false,
        contract: { status: ContractStatus.IN_PROGRESS, client: profile },
      },
      relations: ['contract'],
    });
  }

  async payForJob(jobId: number, profile: Profile): Promise<Job> {
    // Fetch the job with the necessary relations
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['contract', 'contract.client', 'contract.contractor'],
    });

    // Check if the job exists and if the client ID matches the profile ID
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (!job.contract || !job.contract.client) {
      throw new NotFoundException('Job contract or client not found');
    }

    if (job.contract.client.id !== profile.id) {
      throw new NotFoundException('Not authorized');
    }

    // Check if the job has already been paid for
    if (job.isPaid) {
      throw new BadRequestException('Job is already paid');
    }

    // Check if the client's balance is sufficient to pay for the job
    if (profile.balance < job.price) {
      throw new BadRequestException('Insufficient balance to pay for this job');
    }

    // Perform the payment transaction
    profile.balance -= job.price;
    job.contract.contractor.balance += job.price;

    // Update the job status to paid
    job.isPaid = true;
    job.paidDate = new Date();

    // Save the updated job and contract back to the database
    await this.jobRepository.save(job);
    await this.contractRepository.save(job.contract);

    return job;
  }

  async depositBalance(userId: number, amount: number): Promise<Profile> {
    const client = await this.profileRepository.findOne({
      where: { id: userId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const unpaidJobs = await this.getUnpaidJobs(client);

    const totalUnpaid = unpaidJobs.reduce((total, job) => total + job.price, 0);

    if (amount > totalUnpaid * 0.25) {
      throw new BadRequestException(
        'Cannot deposit more than 25% of the total unpaid jobs',
      );
    }

    client.balance += amount;
    await this.profileRepository.save(client);

    return client;
  }
}
