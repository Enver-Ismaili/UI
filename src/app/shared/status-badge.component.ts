import { Component, Input } from '@angular/core';
import { TicketStatus } from '../core/models';
import { statusLabel } from '../core/ticket-status';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" [class]="tone">
      {{ label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: TicketStatus;

  get label(): string {
    return statusLabel(this.status);
  }

  get tone(): string {
    switch (this.status) {
      case 'New':
        return 'bg-slate-100 text-slate-700';
      case 'InProgress':
        return 'bg-sky-100 text-sky-800';
      case 'Resolved':
        return 'bg-amber-100 text-amber-800';
      case 'Closed':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}
