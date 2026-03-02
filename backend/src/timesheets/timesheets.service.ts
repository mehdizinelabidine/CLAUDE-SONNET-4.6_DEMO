import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { StorageService } from '../storage/storage.service';
import { ValidationService } from '../validation/validation.service';
import { MetricsService } from '../metrics/metrics.service';
import { TimesheetEntry } from '../shared/interfaces';
import {
  CreateTimesheetDto,
  WeeklySubmitDto,
} from './dto/create-timesheet.dto';

@Injectable()
export class TimesheetsService {
  constructor(
    private readonly storage: StorageService,
    private readonly validation: ValidationService,
    private readonly metrics: MetricsService,
  ) {}

  async findAll(): Promise<TimesheetEntry[]> {
    return this.storage.readTimesheets<TimesheetEntry>();
  }

  async findByUser(userId: string): Promise<TimesheetEntry[]> {
    const all = await this.storage.readTimesheets<TimesheetEntry>();
    return all.filter((e) => e.userId === userId);
  }

  async findByUserAndWeek(
    userId: string,
    weekStart: string,
  ): Promise<TimesheetEntry[]> {
    const all = await this.storage.readTimesheets<TimesheetEntry>();
    const start = parseISO(weekStart);
    const end = endOfWeek(start, { weekStartsOn: 1 });

    return all.filter((e) => {
      if (e.userId !== userId) return false;
      const d = parseISO(e.date);
      return d >= start && d <= end;
    });
  }

  async findByDate(date: string): Promise<TimesheetEntry[]> {
    const all = await this.storage.readTimesheets<TimesheetEntry>();
    return all.filter((e) => e.date === date);
  }

  async findByDateRange(
    from: string,
    to: string,
  ): Promise<TimesheetEntry[]> {
    const all = await this.storage.readTimesheets<TimesheetEntry>();
    return all.filter((e) => e.date >= from && e.date <= to);
  }

  async create(dto: CreateTimesheetDto): Promise<TimesheetEntry> {
    const start = Date.now();
    await this.metrics.incrementApiCalls();

    const all = await this.storage.readTimesheets<TimesheetEntry>();
    const result = this.validation.validate(
      { userId: dto.userId, date: dto.date, status: dto.status },
      all,
    );

    await this.metrics.recordValidation(Date.now() - start, !result.valid);

    if (!result.valid) {
      throw new BadRequestException({
        message: 'Timesheet validation failed',
        errors: result.errors,
      });
    }

    const entry: TimesheetEntry = {
      id: uuidv4(),
      userId: dto.userId,
      date: dto.date,
      status: dto.status,
      createdAt: new Date().toISOString(),
    };

    await this.storage.writeTimesheets([...all, entry]);
    await this.metrics.recordSubmission(dto.date);
    return entry;
  }

  async submitWeek(dto: WeeklySubmitDto): Promise<{
    submitted: TimesheetEntry[];
    errors: Array<{ date: string; errors: any[] }>;
  }> {
    const submitted: TimesheetEntry[] = [];
    const errors: Array<{ date: string; errors: any[] }> = [];

    for (const entry of dto.entries) {
      try {
        const result = await this.create({
          userId: dto.userId,
          date: entry.date,
          status: entry.status,
        });
        submitted.push(result);
      } catch (err: any) {
        errors.push({
          date: entry.date,
          errors: err.response?.errors ?? [{ message: err.message }],
        });
      }
    }

    return { submitted, errors };
  }

  async delete(id: string): Promise<void> {
    const all = await this.storage.readTimesheets<TimesheetEntry>();
    const exists = all.find((e) => e.id === id);
    if (!exists) throw new NotFoundException(`Entry ${id} not found`);
    await this.storage.writeTimesheets(all.filter((e) => e.id !== id));
  }

  async getWfhCountForWeek(userId: string, weekKey: string): Promise<number> {
    const all = await this.storage.readTimesheets<TimesheetEntry>();
    return this.validation.getWfhCountForWeek(userId, weekKey, all);
  }
}
