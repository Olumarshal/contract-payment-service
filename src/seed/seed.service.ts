import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profile/entities/profile.entity';
import { Contract } from '../contract/entities/contract.entity';
import { Job } from '../job/entities/job.entity';
import {
  generateProfiles,
  generateContracts,
  generateJobs,
} from '../../db/seeds/seed-data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async seed(): Promise<void> {
    // Seed Profiles
    const profiles = generateProfiles(5);
    await this.profileRepository.save(profiles);

    // Seed Contracts
    const contracts = generateContracts(5, profiles);
    await this.contractRepository.save(contracts);

    // Seed Jobs
    const jobs = generateJobs(5, contracts);
    await this.jobRepository.save(jobs);

    console.log('Database seeded successfully.');
  }
}
