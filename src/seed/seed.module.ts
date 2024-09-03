import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../profile/entities/profile.entity';
import { Contract } from '../contract/entities/contract.entity';
import { Job } from '../job/entities/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, Contract, Job])],
  providers: [SeedService],
})
export class SeedModule {}
