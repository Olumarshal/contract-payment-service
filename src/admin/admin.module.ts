import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Job } from '../job/entities/job.entity';
import { Profile } from '../profile/entities/profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Profile]), // Register entities with TypeOrmModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
