import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-due-date',
  standalone: true,
  imports: [DatePipe],
  template: `
    <span [class]="isOverdue ? 'font-medium text-rose-600' : 'text-slate-600'">
      {{ dueAt | date: 'medium' }}
    </span>
  `,
})
export class DueDateComponent {
  @Input({ required: true }) dueAt!: string;
  @Input() isOverdue = false;
}
