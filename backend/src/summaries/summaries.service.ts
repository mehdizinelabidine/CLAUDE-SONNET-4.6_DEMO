import { Injectable } from '@nestjs/common';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
  format,
} from 'date-fns';
import { StorageService } from '../storage/storage.service';
import { ValidationService } from '../validation/validation.service';
import { TimesheetEntry, DaySummary } from '../shared/interfaces';

@Injectable()
export class SummariesService {
  constructor(
    private readonly storage: StorageService,
    private readonly validation: ValidationService,
  ) {}

  async getDaySummary(date: string): Promise<DaySummary> {
    const all = await this.storage.readTimesheets<TimesheetEntry>();
    return this.computeDaySummary(date, all);
  }

  async getWeekSummary(
    weekStart: string,
  ): Promise<{ weekStart: string; days: DaySummary[] }> {
    const all = await this.storage.readTimesheets<TimesheetEntry>();
    const start = parseISO(weekStart);
    const end = endOfWeek(start, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    const summaries = days.map((d) =>
      this.computeDaySummary(format(d, 'yyyy-MM-dd'), all),
    );

    return { weekStart, days: summaries };
  }

  async getAdminDashboard(
    from: string,
    to: string,
  ): Promise<{
    from: string;
    to: string;
    days: DaySummary[];
    totalViolationDays: number;
    summary: { totalOnsite: number; totalWfh: number; totalLeave: number };
  }> {
    const all = await this.storage.readTimesheets<TimesheetEntry>();
    const startDate = parseISO(from);
    const endDate = parseISO(to);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const daySummaries = days.map((d) =>
      this.computeDaySummary(format(d, 'yyyy-MM-dd'), all),
    );

    const totalViolationDays = daySummaries.filter(
      (s) => s.violations.length > 0,
    ).length;

    const summary = daySummaries.reduce(
      (acc, s) => ({
        totalOnsite: acc.totalOnsite + s.onsiteCount,
        totalWfh: acc.totalWfh + s.wfhCount,
        totalLeave: acc.totalLeave + s.leaveCount,
      }),
      { totalOnsite: 0, totalWfh: 0, totalLeave: 0 },
    );

    return { from, to, days: daySummaries, totalViolationDays, summary };
  }

  private computeDaySummary(
    date: string,
    allEntries: TimesheetEntry[],
  ): DaySummary {
    const dayEntries = allEntries.filter((e) => e.date === date);
    const onsiteCount = dayEntries.filter((e) => e.status === 'onsite').length;
    const wfhCount = dayEntries.filter((e) => e.status === 'wfh').length;
    const leaveCount = dayEntries.filter((e) => e.status === 'leave').length;
    const violations = this.validation.checkDayViolations(date, allEntries);

    return {
      date,
      onsiteCount,
      wfhCount,
      leaveCount,
      violations,
      computedAt: new Date().toISOString(),
    };
  }
}
