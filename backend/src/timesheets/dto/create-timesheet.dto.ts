import { IsDateString, IsEnum, IsString } from 'class-validator';
import { TimesheetStatus } from '../../shared/interfaces';

export class CreateTimesheetDto {
  @IsString()
  userId: string;

  @IsDateString()
  date: string; // YYYY-MM-DD

  @IsEnum(['onsite', 'wfh', 'leave'])
  status: TimesheetStatus;
}

export class WeeklySubmitDto {
  @IsString()
  userId: string;

  entries: Array<{
    date: string;
    status: TimesheetStatus;
  }>;
}
