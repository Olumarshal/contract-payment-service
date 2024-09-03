import { Controller, Get, Param, Req } from '@nestjs/common';
import { ContractsService } from './contract.service';
import { Request } from 'express';

@Controller('api/v1/contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get(':id')
  async getContractById(@Param('id') id: number, @Req() req: Request) {
    return this.contractsService.findContractById(id, req['profile']);
  }

  @Get()
  async getContracts(@Req() req: Request) {
    return this.contractsService.findContractsByProfile(req['profile']);
  }
}
