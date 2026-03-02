export type UserRole = "employee" | "admin";
export type TimesheetStatus = "onsite" | "wfh" | "leave";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  clerkUserId?: string;
}

export interface TimesheetEntry {
  id: string;
  userId: string;
  date: string;
  status: TimesheetStatus;
  createdAt: string;
}

export interface DaySummary {
  date: string;
  onsiteCount: number;
  wfhCount: number;
  leaveCount: number;
  violations: string[];
  computedAt: string;
}

export interface WeeklySummary {
  weekStart: string;
  days: DaySummary[];
}

export interface AdminDashboard {
  from: string;
  to: string;
  days: DaySummary[];
  totalViolationDays: number;
  summary: {
    totalOnsite: number;
    totalWfh: number;
    totalLeave: number;
  };
}

export interface MetricsData {
  apiCalls: number;
  totalValidationMs: number;
  validationCount: number;
  avgValidationMs: number;
  submissionsPerWeek: Record<string, number>;
  violationsPerWeek: Record<string, number>;
  currentWeekSubmissions: number;
  currentWeekViolations: number;
}

export interface WfhCount {
  userId: string;
  weekKey: string;
  wfhCount: number;
  remaining: number;
}

export interface ValidationError {
  code: string;
  message: string;
}

export interface WeeklyEntry {
  date: string;
  status: TimesheetStatus;
}

export interface WeekDay {
  label: string;
  date: string;
  isToday: boolean;
  isWeekend: boolean;
}
