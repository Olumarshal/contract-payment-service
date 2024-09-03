import { Module } from '@nestjs/common';
import { Profile } from './entities/profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile]), // Register entities with TypeOrmModule
  ],
})
export class ProfileModule {}
