import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { Profile } from '../profile/entities/profile.entity';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async findContractById(id: number, profile: Profile): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: [
        { id, client: profile },
        { id, contractor: profile },
      ],
    });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }
    return contract;
  }

  async findContractsByProfile(profile: Profile): Promise<Contract[]> {
    return this.contractRepository.find({
      where: [{ client: profile }, { contractor: profile }],
      order: { createdAt: 'DESC' },
    });
  }
}
