import { Injectable, signal, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  parseISO,
  getISOWeek,
  getISOWeekYear,
} from "date-fns";
import { ApiService } from "./api.service";
import { TimesheetEntry, TimesheetStatus, WeekDay } from "../models/models";

@Injectable({ providedIn: "root" })
export class TimesheetService {
  private readonly api = inject(ApiService);

  // ── State ──────────────────────────────────────────────────────────────
  readonly currentWeekStart = signal<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  readonly currentUserId = signal<string>("");

  readonly entries = signal<TimesheetEntry[]>([]);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly saveErrors = signal<any[]>([]);

  // Pending entries (not yet submitted) — keyed by date
  readonly pendingEntries = signal<Record<string, TimesheetStatus>>({});

  // WFH remaining for current week
  readonly wfhRemaining = signal<number>(3);

  // ── Derived ────────────────────────────────────────────────────────────
  readonly weekDays = computed<WeekDay[]>(() => {
    const start = this.currentWeekStart();
    const end = endOfWeek(start, { weekStartsOn: 1 });
    const today = format(new Date(), "yyyy-MM-dd");
    return eachDayOfInterval({ start, end }).map((d) => ({
      label: format(d, "EEE d"),
      date: format(d, "yyyy-MM-dd"),
      isToday: format(d, "yyyy-MM-dd") === today,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    }));
  });

  readonly weekLabel = computed(() => {
    const start = this.currentWeekStart();
    const end = endOfWeek(start, { weekStartsOn: 1 });
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  });

  readonly currentWeekKey = computed(() => {
    const date = this.currentWeekStart();
    const year = getISOWeekYear(date);
    const week = getISOWeek(date).toString().padStart(2, "0");
    return `${year}-W${week}`;
  });

  // ── Actions ────────────────────────────────────────────────────────────
  previousWeek() {
    const d = new Date(this.currentWeekStart());
    d.setDate(d.getDate() - 7);
    this.currentWeekStart.set(startOfWeek(d, { weekStartsOn: 1 }));
    this.loadWeekEntries();
  }

  nextWeek() {
    const d = new Date(this.currentWeekStart());
    d.setDate(d.getDate() + 7);
    this.currentWeekStart.set(startOfWeek(d, { weekStartsOn: 1 }));
    this.loadWeekEntries();
  }

  goToCurrentWeek() {
    this.currentWeekStart.set(startOfWeek(new Date(), { weekStartsOn: 1 }));
    this.loadWeekEntries();
  }

  setPendingStatus(date: string, status: TimesheetStatus) {
    this.pendingEntries.update((prev) => ({ ...prev, [date]: status }));
    this.updateWfhCount();
  }

  clearPending() {
    this.pendingEntries.set({});
  }

  getStatusForDate(date: string): TimesheetStatus | null {
    const pending = this.pendingEntries();
    if (pending[date]) return pending[date];
    const entry = this.entries().find((e) => e.date === date);
    return entry ? entry.status : null;
  }

  loadWeekEntries() {
    const userId = this.currentUserId();
    if (!userId) return;
    this.isLoading.set(true);
    const weekStart = format(this.currentWeekStart(), "yyyy-MM-dd");

    this.api.getWeekTimesheets(userId, weekStart).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.isLoading.set(false);
        this.pendingEntries.set({});
        this.loadWfhCount();
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadWfhCount() {
    const userId = this.currentUserId();
    if (!userId) return;
    this.api.getWfhCount(userId, this.currentWeekKey()).subscribe({
      next: (data) => this.wfhRemaining.set(data.remaining),
    });
  }

  async submitWeek(): Promise<boolean> {
    const pending = this.pendingEntries();
    const userId = this.currentUserId();
    if (!userId || Object.keys(pending).length === 0) return false;

    this.isSaving.set(true);
    this.saveErrors.set([]);

    return new Promise((resolve) => {
      this.api
        .submitWeek({
          userId,
          entries: Object.entries(pending).map(([date, status]) => ({
            date,
            status,
          })),
        })
        .subscribe({
          next: (result) => {
            if (result.submitted.length > 0) {
              this.entries.update((prev) => [...prev, ...result.submitted]);
              this.pendingEntries.set({});
            }
            if (result.errors.length > 0) {
              this.saveErrors.set(result.errors);
            }
            this.loadWfhCount();
            this.isSaving.set(false);
            resolve(result.errors.length === 0);
          },
          error: (err) => {
            this.saveErrors.set([
              { errors: [{ message: "Submission failed" }] },
            ]);
            this.isSaving.set(false);
            resolve(false);
          },
        });
    });
  }

  private updateWfhCount() {
    const pending = this.pendingEntries();
    const submitted = this.entries();
    const weekKey = this.currentWeekKey();
    const userId = this.currentUserId();

    const submittedWfh = submitted.filter(
      (e) => e.userId === userId && e.status === "wfh",
    ).length;

    const pendingWfh = Object.values(pending).filter((s) => s === "wfh").length;
    this.wfhRemaining.set(3 - submittedWfh - pendingWfh);
  }
}
