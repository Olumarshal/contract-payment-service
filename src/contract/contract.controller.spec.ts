import { Test, TestingModule } from '@nestjs/testing';
import { ContractsController } from './contract.controller';
import { ContractsService } from './contract.service';
import { Request } from 'express';
import { Profile } from '../profile/entities/profile.entity';
import { Contract } from './entities/contract.entity';
import { NotFoundException } from '@nestjs/common';
import { mock, MockProxy } from 'jest-mock-extended';

describe('ContractsController', () => {
  let controller: ContractsController;
  let service: MockProxy<ContractsService>;

  beforeEach(async () => {
    service = mock<ContractsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractsController],
      providers: [{ provide: ContractsService, useValue: service }],
    }).compile();

    controller = module.get<ContractsController>(ContractsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getContractById', () => {
    it('should return a contract for the given ID', async () => {
      const mockProfile = new Profile();
      const mockContract = new Contract();
      const req = { profile: mockProfile } as unknown as Request;

      service.findContractById.mockResolvedValue(mockContract);

      const result = await controller.getContractById(1, req);

      expect(result).toBe(mockContract);
      expect(service.findContractById).toHaveBeenCalledWith(1, mockProfile);
    });

    it('should throw NotFoundException if contract not found', async () => {
      const mockProfile = new Profile();
      const req = { profile: mockProfile } as unknown as Request;

      service.findContractById.mockRejectedValue(
        new NotFoundException('Contract not found'),
      );

      await expect(controller.getContractById(1, req)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findContractById).toHaveBeenCalledWith(1, mockProfile);
    });
  });

  describe('getContracts', () => {
    it('should return an array of contracts for the profile', async () => {
      const mockProfile = new Profile();
      const mockContracts = [new Contract(), new Contract()];
      const req = { profile: mockProfile } as unknown as Request;

      service.findContractsByProfile.mockResolvedValue(mockContracts);

      const result = await controller.getContracts(req);

      expect(result).toBe(mockContracts);
      expect(service.findContractsByProfile).toHaveBeenCalledWith(mockProfile);
    });
  });
});
