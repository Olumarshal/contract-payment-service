import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profile/entities/profile.entity';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const profileId = req.header('Profile-Id');
    if (!profileId) {
      throw new UnauthorizedException('Profile-Id header not found');
    }

    const profile = await this.profileRepository.findOne({
      where: { id: parseInt(profileId) },
    });

    if (!profile) {
      throw new UnauthorizedException('Profile not found');
    }

    req['profile'] = profile;
    next();
  }
}
