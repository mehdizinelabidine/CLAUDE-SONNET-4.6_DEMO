import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SlicePipe } from "@angular/common";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  parseISO,
} from "date-fns";
import { ApiService } from "../../../core/services/api.service";
import { AuthService } from "../../../core/auth/auth.service";
import { TimesheetEntry } from "../../../core/models/models";
import { StatusChipComponent } from "../../../shared/components/status-chip/status-chip";

@Component({
  selector: "app-history",
  standalone: true,
  imports: [FormsModule, StatusChipComponent, SlicePipe],
  templateUrl: "./history.html",
  styleUrl: "./history.scss",
})
export class HistoryComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly entries = signal<TimesheetEntry[]>([]);
  readonly isLoading = signal(false);
  readonly viewMode = signal<"weekly" | "monthly">("monthly");
  readonly selectedMonth = signal(format(new Date(), "yyyy-MM"));

  readonly groupedEntries = computed(() => {
    const all = this.entries();
    if (this.viewMode() === "monthly") {
      return this.groupByWeek(all);
    }
    return this.groupByWeek(all);
  });

  readonly stats = computed(() => {
    const all = this.entries();
    return {
      total: all.length,
      onsite: all.filter((e) => e.status === "onsite").length,
      wfh: all.filter((e) => e.status === "wfh").length,
      leave: all.filter((e) => e.status === "leave").length,
    };
  });

  ngOnInit() {
    this.load();
  }

  load() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    this.isLoading.set(true);
    const month = this.selectedMonth();
    const from = `${month}-01`;
    const to = format(endOfMonth(parseISO(from)), "yyyy-MM-dd");

    this.api.getRangeTimesheets(from, to).subscribe({
      next: (data) => {
        const mine = data.filter((e) => e.userId === userId);
        this.entries.set(mine.sort((a, b) => b.date.localeCompare(a.date)));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  changeMonth(delta: number) {
    const [year, month] = this.selectedMonth().split("-").map(Number);
    const d = new Date(year, month - 1 + delta, 1);
    this.selectedMonth.set(format(d, "yyyy-MM"));
    this.load();
  }

  private groupByWeek(entries: TimesheetEntry[]): Array<{
    weekLabel: string;
    entries: TimesheetEntry[];
  }> {
    const map = new Map<string, TimesheetEntry[]>();
    entries.forEach((e) => {
      const weekStart = format(
        startOfWeek(parseISO(e.date), { weekStartsOn: 1 }),
        "yyyy-MM-dd",
      );
      if (!map.has(weekStart)) map.set(weekStart, []);
      map.get(weekStart)!.push(e);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([weekStart, wEntries]) => {
        const end = endOfWeek(parseISO(weekStart), { weekStartsOn: 1 });
        return {
          weekLabel: `${format(parseISO(weekStart), "MMM d")} – ${format(end, "MMM d")}`,
          entries: wEntries.sort((a, b) => b.date.localeCompare(a.date)),
        };
      });
  }
}
