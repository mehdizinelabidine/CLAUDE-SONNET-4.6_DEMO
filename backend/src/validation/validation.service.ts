import { Injectable } from "@nestjs/common";
import { getISOWeek, getISOWeekYear } from "date-fns";
import {
  TimesheetEntry,
  ValidationResult,
  ValidationError,
  TimesheetStatus,
} from "../shared/interfaces";

export const RULES = {
  MIN_ONSITE_PER_DAY: 8,
  MAX_WFH_PER_WEEK: 3,
  TEAM_SIZE: 22,
};

@Injectable()
export class ValidationService {
  /**
   * Validates a new entry against all business rules.
   * Returns a structured result with all violations (not just the first).
   */
  validate(
    newEntry: { userId: string; date: string; status: TimesheetStatus },
    existingEntries: TimesheetEntry[],
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Rule 1: No duplicate entries per user per day
    const duplicate = existingEntries.find(
      (e) => e.userId === newEntry.userId && e.date === newEntry.date,
    );
    if (duplicate) {
      errors.push({
        code: "DUPLICATE_ENTRY",
        message: `User already has an entry for ${newEntry.date}.`,
      });
    }

    // Rule 2: Max 3 WFH days per employee per week
    if (newEntry.status === "wfh") {
      const weekKey = this.getWeekKey(newEntry.date);
      const wfhThisWeek = existingEntries.filter(
        (e) =>
          e.userId === newEntry.userId &&
          e.status === "wfh" &&
          this.getWeekKey(e.date) === weekKey,
      );
      if (wfhThisWeek.length >= RULES.MAX_WFH_PER_WEEK) {
        errors.push({
          code: "WFH_LIMIT_EXCEEDED",
          message: `User has already used ${RULES.MAX_WFH_PER_WEEK} WFH days this week (${weekKey}).`,
        });
      }
    }

    // Rule 3: Minimum 8 On-Site per day (warn but allow if adding onsite, block if would push below)
    if (newEntry.status !== "onsite") {
      const onsiteToday = existingEntries.filter(
        (e) => e.date === newEntry.date && e.status === "onsite",
      ).length;

      // If there's no existing entry for this user today, adding WFH/leave doesn't reduce onsite count
      // But if they had onsite and are updating (not covered here since we block duplicates),
      // we just project: current onsite stays same; flag if already below threshold
      if (onsiteToday < RULES.MIN_ONSITE_PER_DAY) {
        errors.push({
          code: "ONSITE_MINIMUM_WARNING",
          message: `Only ${onsiteToday} employees are On-Site on ${newEntry.date}. Minimum required is ${RULES.MIN_ONSITE_PER_DAY}.`,
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Checks if a given day violates the onsite minimum threshold.
   */
  checkDayViolations(date: string, entries: TimesheetEntry[]): string[] {
    const violations: string[] = [];
    const dayEntries = entries.filter((e) => e.date === date);
    const onsiteCount = dayEntries.filter((e) => e.status === "onsite").length;

    if (onsiteCount < RULES.MIN_ONSITE_PER_DAY) {
      violations.push(
        `ONSITE_BELOW_MINIMUM: ${onsiteCount}/${RULES.MIN_ONSITE_PER_DAY} on-site employees on ${date}`,
      );
    }

    return violations;
  }

  /**
   * Returns WFH usage for a user in the given week.
   */
  getWfhCountForWeek(
    userId: string,
    weekKey: string,
    entries: TimesheetEntry[],
  ): number {
    return entries.filter(
      (e) =>
        e.userId === userId &&
        e.status === "wfh" &&
        this.getWeekKey(e.date) === weekKey,
    ).length;
  }

  /**
   * Returns 'YYYY-WW' format week key for a date string.
   */
  getWeekKey(dateStr: string): string {
    const date = new Date(dateStr);
    const year = getISOWeekYear(date);
    const week = getISOWeek(date).toString().padStart(2, "0");
    return `${year}-W${week}`;
  }
}
