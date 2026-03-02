import { Injectable } from '@nestjs/common';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { StorageService } from '../storage/storage.service';
import { MetricsData } from '../shared/interfaces';

@Injectable()
export class MetricsService {
  constructor(private readonly storage: StorageService) {}

  async getMetrics(): Promise<MetricsData & {
    avgValidationMs: number;
    currentWeekSubmissions: number;
    currentWeekViolations: number;
  }> {
    const data = await this.storage.readMetrics<MetricsData>();
    const weekKey = this.currentWeekKey();

    return {
      ...data,
      avgValidationMs:
        data.validationCount > 0
          ? Math.round(data.totalValidationMs / data.validationCount)
          : 0,
      currentWeekSubmissions: data.submissionsPerWeek[weekKey] ?? 0,
      currentWeekViolations: data.violationsPerWeek[weekKey] ?? 0,
    };
  }

  async incrementApiCalls(): Promise<void> {
    const data = await this.storage.readMetrics<MetricsData>();
    data.apiCalls = (data.apiCalls ?? 0) + 1;
    await this.storage.writeMetrics(data);
  }

  async recordValidation(durationMs: number, hadViolation: boolean): Promise<void> {
    const data = await this.storage.readMetrics<MetricsData>();
    data.totalValidationMs = (data.totalValidationMs ?? 0) + durationMs;
    data.validationCount = (data.validationCount ?? 0) + 1;

    if (hadViolation) {
      const weekKey = this.currentWeekKey();
      data.violationsPerWeek[weekKey] =
        (data.violationsPerWeek[weekKey] ?? 0) + 1;
    }

    await this.storage.writeMetrics(data);
  }

  async recordSubmission(date: string): Promise<void> {
    const data = await this.storage.readMetrics<MetricsData>();
    const weekKey = this.weekKeyForDate(date);
    data.submissionsPerWeek[weekKey] =
      (data.submissionsPerWeek[weekKey] ?? 0) + 1;
    await this.storage.writeMetrics(data);
  }

  private currentWeekKey(): string {
    return this.weekKeyForDate(new Date().toISOString().slice(0, 10));
  }

  private weekKeyForDate(dateStr: string): string {
    const date = new Date(dateStr);
    const year = getISOWeekYear(date);
    const week = getISOWeek(date).toString().padStart(2, '0');
    return `${year}-W${week}`;
  }
}
