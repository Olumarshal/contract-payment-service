import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../job/entities/job.entity';
import { Profile } from '../profile/entities/profile.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getBestProfession(
    start: string,
    end: string,
  ): Promise<{ profession: string; totalEarnings: number }> {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const result = await this.jobRepository
      .createQueryBuilder('job')
      .select('profile.profession', 'profession')
      .addSelect('SUM(job.price)', 'totalEarnings')
      .innerJoin('job.contract', 'contract')
      .innerJoin('contract.contractor', 'profile')
      .where('job.paidDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('job.isPaid = :isPaid', { isPaid: true })
      .groupBy('profile.profession')
      .orderBy('SUM(job.price)', 'DESC') // Use the full aggregation in the orderBy clause
      .limit(1) // Add the limit clause to get only one record
      .getRawOne();

    return result;
  }

  async getBestClients(
    start: string,
    end: string,
    limit: number,
  ): Promise<{ clientId: number; totalPaid: number }[]> {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const result = await this.jobRepository
      .createQueryBuilder('job')
      .select('contract.clientId', 'clientId')
      .addSelect('SUM(job.price)', 'totalPaid')
      .innerJoin('job.contract', 'contract')
      .where('job.paidDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('job.isPaid = true')
      .groupBy('contract.clientId')
      .orderBy('"totalPaid"', 'DESC') // Corrected line: use double quotes for the alias
      .limit(limit)
      .getRawMany();

    return result;
  }
}
