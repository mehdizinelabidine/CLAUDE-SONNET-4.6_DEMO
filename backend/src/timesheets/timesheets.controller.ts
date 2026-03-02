import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TimesheetsService } from './timesheets.service';
import {
  CreateTimesheetDto,
  WeeklySubmitDto,
} from './dto/create-timesheet.dto';

@Controller('timesheets')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Get()
  findAll(@Query('userId') userId?: string, @Query('date') date?: string) {
    if (userId && date) return this.timesheetsService.findByDate(date);
    if (userId) return this.timesheetsService.findByUser(userId);
    if (date) return this.timesheetsService.findByDate(date);
    return this.timesheetsService.findAll();
  }

  @Get('week')
  findByWeek(
    @Query('userId') userId: string,
    @Query('weekStart') weekStart: string,
  ) {
    return this.timesheetsService.findByUserAndWeek(userId, weekStart);
  }

  @Get('range')
  findByRange(@Query('from') from: string, @Query('to') to: string) {
    return this.timesheetsService.findByDateRange(from, to);
  }

  @Get('wfh-count')
  getWfhCount(
    @Query('userId') userId: string,
    @Query('weekKey') weekKey: string,
  ) {
    return this.timesheetsService
      .getWfhCountForWeek(userId, weekKey)
      .then((count) => ({ userId, weekKey, wfhCount: count, remaining: 3 - count }));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTimesheetDto) {
    return this.timesheetsService.create(dto);
  }

  @Post('submit-week')
  @HttpCode(HttpStatus.CREATED)
  submitWeek(@Body() dto: WeeklySubmitDto) {
    return this.timesheetsService.submitWeek(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.timesheetsService.delete(id);
  }
}
