import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  User,
  TimesheetEntry,
  DaySummary,
  WeeklySummary,
  AdminDashboard,
  MetricsData,
  WfhCount,
} from "../models/models";

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = "/api";

  // ── Users ──────────────────────────────────────────────────────────────
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/users`);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.base}/users/me`);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/users/${id}`);
  }

  createUser(data: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.base}/users`, data);
  }

  // ── Timesheets ─────────────────────────────────────────────────────────
  getTimesheets(params?: {
    userId?: string;
    date?: string;
  }): Observable<TimesheetEntry[]> {
    let httpParams = new HttpParams();
    if (params?.userId) httpParams = httpParams.set("userId", params.userId);
    if (params?.date) httpParams = httpParams.set("date", params.date);
    return this.http.get<TimesheetEntry[]>(`${this.base}/timesheets`, {
      params: httpParams,
    });
  }

  getWeekTimesheets(
    userId: string,
    weekStart: string,
  ): Observable<TimesheetEntry[]> {
    const params = new HttpParams()
      .set("userId", userId)
      .set("weekStart", weekStart);
    return this.http.get<TimesheetEntry[]>(`${this.base}/timesheets/week`, {
      params,
    });
  }

  getRangeTimesheets(from: string, to: string): Observable<TimesheetEntry[]> {
    const params = new HttpParams().set("from", from).set("to", to);
    return this.http.get<TimesheetEntry[]>(`${this.base}/timesheets/range`, {
      params,
    });
  }

  createEntry(data: {
    userId: string;
    date: string;
    status: string;
  }): Observable<TimesheetEntry> {
    return this.http.post<TimesheetEntry>(`${this.base}/timesheets`, data);
  }

  submitWeek(data: {
    userId: string;
    entries: Array<{ date: string; status: string }>;
  }): Observable<{ submitted: TimesheetEntry[]; errors: any[] }> {
    return this.http.post<any>(`${this.base}/timesheets/submit-week`, data);
  }

  deleteEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/timesheets/${id}`);
  }

  getWfhCount(userId: string, weekKey: string): Observable<WfhCount> {
    const params = new HttpParams()
      .set("userId", userId)
      .set("weekKey", weekKey);
    return this.http.get<WfhCount>(`${this.base}/timesheets/wfh-count`, {
      params,
    });
  }

  // ── Summaries ──────────────────────────────────────────────────────────
  getDaySummary(date: string): Observable<DaySummary> {
    const params = new HttpParams().set("date", date);
    return this.http.get<DaySummary>(`${this.base}/summaries/day`, { params });
  }

  getWeekSummary(weekStart: string): Observable<WeeklySummary> {
    const params = new HttpParams().set("weekStart", weekStart);
    return this.http.get<WeeklySummary>(`${this.base}/summaries/week`, {
      params,
    });
  }

  getAdminDashboard(from: string, to: string): Observable<AdminDashboard> {
    const params = new HttpParams().set("from", from).set("to", to);
    return this.http.get<AdminDashboard>(`${this.base}/summaries/admin`, {
      params,
    });
  }

  // ── Metrics ────────────────────────────────────────────────────────────
  getMetrics(): Observable<MetricsData> {
    return this.http.get<MetricsData>(`${this.base}/metrics`);
  }

  // ── Reports ────────────────────────────────────────────────────────────
  downloadCsv(from: string, to: string): void {
    const url = `${this.base}/reports/csv?from=${from}&to=${to}`;
    window.open(url, "_blank");
  }

  downloadPdf(from: string, to: string): void {
    const url = `${this.base}/reports/pdf?from=${from}&to=${to}`;
    window.open(url, "_blank");
  }
}
