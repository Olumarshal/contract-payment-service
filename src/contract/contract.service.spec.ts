import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { ContractsService } from './contract.service';
import { Contract } from './entities/contract.entity';
import { Profile } from '../profile/entities/profile.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ContractsService', () => {
  let service: ContractsService;
  let contractRepository: MockProxy<Repository<Contract>>;
  let profileRepository: MockProxy<Repository<Profile>>;

  beforeEach(async () => {
    contractRepository = mock<Repository<Contract>>();
    profileRepository = mock<Repository<Profile>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: getRepositoryToken(Contract), useValue: contractRepository },
        { provide: getRepositoryToken(Profile), useValue: profileRepository },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findContractById', () => {
    it('should return a contract if found', async () => {
      const mockProfile = new Profile();
      const mockContract = new Contract();
      mockContract.id = 1;
      contractRepository.findOne.mockResolvedValue(mockContract);

      const result = await service.findContractById(1, mockProfile);
      expect(result).toEqual(mockContract);
      expect(contractRepository.findOne).toHaveBeenCalledWith({
        where: [
          { id: 1, client: mockProfile },
          { id: 1, contractor: mockProfile },
        ],
      });
    });

    it('should throw NotFoundException if contract not found', async () => {
      contractRepository.findOne.mockResolvedValue(null);

      const mockProfile = new Profile();
      await expect(service.findContractById(1, mockProfile)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findContractsByProfile', () => {
    it('should return contracts for a given profile', async () => {
      const mockProfile = new Profile();
      const mockContracts = [new Contract(), new Contract()];
      contractRepository.find.mockResolvedValue(mockContracts);

      const result = await service.findContractsByProfile(mockProfile);
      expect(result).toEqual(mockContracts);
      expect(contractRepository.find).toHaveBeenCalledWith({
        where: [{ client: mockProfile }, { contractor: mockProfile }],
        order: { createdAt: 'DESC' },
      });
    });
  });
});
