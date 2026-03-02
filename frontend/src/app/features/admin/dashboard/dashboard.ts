import { Component, inject, OnInit, signal, computed } from '@angular/core';
import {
  format,
  startOfWeek,
  endOfWeek,
  parseISO,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { ApiService } from '../../../core/services/api.service';
import { AdminDashboard, DaySummary } from '../../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly dashboard = signal<AdminDashboard | null>(null);
  readonly isLoading = signal(false);

  readonly currentWeekStart = signal<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  readonly weekLabel = computed(() => {
    const s = this.currentWeekStart();
    const e = endOfWeek(s, { weekStartsOn: 1 });
    return `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`;
  });

  readonly kpis = computed(() => {
    const d = this.dashboard();
    if (!d) return null;
    return {
      totalOnsite: d.summary.totalOnsite,
      totalWfh: d.summary.totalWfh,
      totalLeave: d.summary.totalLeave,
      violationDays: d.totalViolationDays,
    };
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    const from = format(this.currentWeekStart(), 'yyyy-MM-dd');
    const to = format(
      endOfWeek(this.currentWeekStart(), { weekStartsOn: 1 }),
      'yyyy-MM-dd',
    );

    this.api.getAdminDashboard(from, to).subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  previousWeek() {
    this.currentWeekStart.set(subWeeks(this.currentWeekStart(), 1));
    this.load();
  }

  nextWeek() {
    this.currentWeekStart.set(addWeeks(this.currentWeekStart(), 1));
    this.load();
  }

  hasViolation(day: DaySummary): boolean {
    return day.violations.length > 0;
  }

  getOnsiteWidth(day: DaySummary): number {
    const total = day.onsiteCount + day.wfhCount + day.leaveCount;
    return total === 0 ? 0 : Math.round((day.onsiteCount / total) * 100);
  }
}
