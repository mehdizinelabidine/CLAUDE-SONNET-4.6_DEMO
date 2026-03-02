import { Component, inject, OnInit, signal } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { ApiService } from "../../../core/services/api.service";
import { MetricsData } from "../../../core/models/models";

@Component({
  selector: "app-metrics",
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: "./metrics.html",
  styleUrl: "./metrics.scss",
})
export class MetricsComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly metrics = signal<MetricsData | null>(null);
  readonly isLoading = signal(false);

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.api.getMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  topWeeks(
    data: Record<string, number>,
    limit = 5,
  ): Array<{ week: string; count: number }> {
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([week, count]) => ({ week, count }));
  }
}
