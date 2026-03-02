import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip';
import { TimesheetStatus } from '../../../core/models/models';

@Component({
  selector: 'app-weekly-grid',
  standalone: true,
  imports: [FormsModule, StatusChipComponent],
  templateUrl: './weekly-grid.html',
  styleUrl: './weekly-grid.scss',
})
export class WeeklyGridComponent implements OnInit {
  readonly ts = inject(TimesheetService);

  readonly statusOptions: { value: TimesheetStatus; label: string }[] = [
    { value: 'onsite', label: 'On-Site' },
    { value: 'wfh', label: 'WFH' },
    { value: 'leave', label: 'Leave' },
  ];

  ngOnInit() {
    this.ts.loadWeekEntries();
  }

  getStatus(date: string): TimesheetStatus | null {
    return this.ts.getStatusForDate(date);
  }

  isSubmitted(date: string): boolean {
    return this.ts.entries().some((e) => e.date === date);
  }

  isPending(date: string): boolean {
    return !!this.ts.pendingEntries()[date];
  }

  selectStatus(date: string, status: TimesheetStatus) {
    if (this.isSubmitted(date)) return;
    const current = this.ts.pendingEntries()[date];
    if (current === status) {
      // Deselect
      const pending = { ...this.ts.pendingEntries() };
      delete pending[date];
      this.ts.pendingEntries.set(pending);
    } else {
      this.ts.setPendingStatus(date, status);
    }
  }

  get hasPending(): boolean {
    return Object.keys(this.ts.pendingEntries()).length > 0;
  }

  async submit() {
    await this.ts.submitWeek();
  }
}
