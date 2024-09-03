import { Module } from '@nestjs/common';
import { JobsService } from './job.service';
import { JobsController } from './job.controller';
import { Contract } from '../contract/entities/contract.entity';
import { Profile } from '../profile/entities/profile.entity';
import { Job } from './entities/job.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Profile, Job])],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobModule {}
