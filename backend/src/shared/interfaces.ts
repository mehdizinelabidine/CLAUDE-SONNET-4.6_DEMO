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
  date: string; // YYYY-MM-DD
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

export interface MetricsData {
  apiCalls: number;
  totalValidationMs: number;
  validationCount: number;
  submissionsPerWeek: Record<string, number>; // 'YYYY-WW' -> count
  violationsPerWeek: Record<string, number>; // 'YYYY-WW' -> count
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  code: string;
  message: string;
}
