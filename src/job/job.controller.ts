import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { JobsService } from './job.service';

@Controller('api/v1')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('jobs/unpaid')
  async getUnpaidJobs(@Req() req: Request) {
    return this.jobsService.getUnpaidJobs(req['profile']);
  }

  @Post('jobs/:jobId/pay')
  async payForJob(@Param('jobId') jobId: number, @Req() req: Request) {
    return this.jobsService.payForJob(jobId, req['profile']);
  }

  @Post('balances/deposit')
  async depositBalance(
    @Body('userId') userId: number,
    @Body('amount') amount: number,
  ) {
    return this.jobsService.depositBalance(userId, amount);
  }
}
