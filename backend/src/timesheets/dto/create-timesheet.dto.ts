import {
  IsDateString,
  IsEnum,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TimesheetStatus } from '../../shared/interfaces';

export class CreateTimesheetDto {
  @IsString()
  userId: string;

  @IsDateString()
  date: string; // YYYY-MM-DD

  @IsEnum(['onsite', 'wfh', 'leave'])
  status: TimesheetStatus;
}

export class WeeklyEntryDto {
  @IsDateString()
  date: string;

  @IsEnum(['onsite', 'wfh', 'leave'])
  status: TimesheetStatus;
}

export class WeeklySubmitDto {
  @IsString()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyEntryDto)
  entries: WeeklyEntryDto[];
}
