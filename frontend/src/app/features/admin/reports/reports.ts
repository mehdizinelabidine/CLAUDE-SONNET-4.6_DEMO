import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { format, subDays } from 'date-fns';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsComponent {
  private readonly api = inject(ApiService);

  readonly from = signal(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  readonly to = signal(format(new Date(), 'yyyy-MM-dd'));
  readonly isExporting = signal(false);

  setFrom(value: string) { this.from.set(value); }
  setTo(value: string) { this.to.set(value); }

  exportCsv() {
    this.isExporting.set(true);
    this.api.downloadCsv(this.from(), this.to());
    setTimeout(() => this.isExporting.set(false), 1000);
  }

  exportPdf() {
    this.isExporting.set(true);
    this.api.downloadPdf(this.from(), this.to());
    setTimeout(() => this.isExporting.set(false), 1000);
  }

  quickRange(days: number) {
    this.to.set(format(new Date(), 'yyyy-MM-dd'));
    this.from.set(format(subDays(new Date(), days), 'yyyy-MM-dd'));
  }
}
