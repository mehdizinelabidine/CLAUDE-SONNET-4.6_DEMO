import { Component, Input } from '@angular/core';
import { TimesheetStatus } from '../../../core/models/models';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  template: `
    <span class="chip chip--{{ status ?? 'empty' }}">
      {{ label }}
    </span>
  `,
  styles: [
    `
      .chip {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.3px;
        white-space: nowrap;

        &--onsite {
          background: #d4f5e2;
          color: #0d6e3a;
        }
        &--wfh {
          background: #dbeafe;
          color: #1d4ed8;
        }
        &--leave {
          background: #ffedd5;
          color: #c2410c;
        }
        &--empty {
          background: #f0f0f4;
          color: #999;
        }
      }
    `,
  ],
})
export class StatusChipComponent {
  @Input() status: TimesheetStatus | null = null;

  get label(): string {
    if (!this.status) return '—';
    const labels: Record<TimesheetStatus, string> = {
      onsite: 'On-Site',
      wfh: 'WFH',
      leave: 'Leave',
    };
    return labels[this.status];
  }
}
