import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('best-profession')
  async getBestProfession(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.adminService.getBestProfession(start, end);
  }

  @Get('best-clients')
  async getBestClients(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('limit') limit: number = 2,
  ) {
    return this.adminService.getBestClients(start, end, limit);
  }
}
