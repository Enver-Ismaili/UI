import { Component, Input } from '@angular/core';
import { Priority } from '../core/models';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" [class]="tone">
      {{ priority }}
    </span>
  `,
})
export class PriorityBadgeComponent {
  @Input({ required: true }) priority!: Priority;

  get tone(): string {
    switch (this.priority) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Normal':
        return 'bg-slate-100 text-slate-700';
      case 'Low':
        return 'bg-zinc-100 text-zinc-600';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}
