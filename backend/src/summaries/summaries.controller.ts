import { Controller, Get, Query } from '@nestjs/common';
import { SummariesService } from './summaries.service';

@Controller('summaries')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Get('day')
  getDay(@Query('date') date: string) {
    return this.summariesService.getDaySummary(date);
  }

  @Get('week')
  getWeek(@Query('weekStart') weekStart: string) {
    return this.summariesService.getWeekSummary(weekStart);
  }

  @Get('admin')
  getAdminDashboard(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.summariesService.getAdminDashboard(from, to);
  }
}
