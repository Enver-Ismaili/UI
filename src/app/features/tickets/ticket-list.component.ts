import { NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { AgentService } from '../../core/agent.service';
import { formatProblem, toApiProblem } from '../../core/api-error';
import { AgentListItem, Priority, TicketListItem, TicketStatus } from '../../core/models';
import { TicketService } from '../../core/ticket.service';
import { DueDateComponent } from '../../shared/due-date.component';
import { PriorityBadgeComponent } from '../../shared/priority-badge.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgClass,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    DueDateComponent,
  ],
  templateUrl: './ticket-list.component.html',
})
export class TicketListComponent implements OnInit {
  private readonly ticketsApi = inject(TicketService);
  private readonly agentsApi = inject(AgentService);
  private readonly fb = inject(FormBuilder);

  readonly statuses: TicketStatus[] = ['New', 'InProgress', 'Resolved', 'Closed'];
  readonly priorities: Priority[] = ['Low', 'Normal', 'High', 'Critical'];

  agents: AgentListItem[] = [];
  items: TicketListItem[] = [];
  totalCount = 0;
  page = 1;
  pageSize = 10;
  loading = false;
  errorMessage = '';

  readonly filters = this.fb.nonNullable.group({
    search: '',
    status: '' as TicketStatus | '',
    priority: '' as Priority | '',
    agentId: '',
    overdueOnly: false,
  });

  ngOnInit(): void {
    this.agentsApi.list().subscribe({
      next: (result) => {
        if (result.success) {
          this.agents = result.items;
        }
      },
    });

    this.filters.valueChanges
      .pipe(
        startWith(this.filters.getRawValue()),
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap(() => {
          this.page = 1;
        }),
        switchMap(() => this.fetch(this.filters.getRawValue())),
      )
      .subscribe();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) {
      return;
    }
    this.page = page;
    this.fetch(this.filters.getRawValue()).subscribe();
  }

  clearFilters(): void {
    this.filters.reset({
      search: '',
      status: '',
      priority: '',
      agentId: '',
      overdueOnly: false,
    });
  }

  private fetch(value: ReturnType<typeof this.filters.getRawValue>) {
    this.loading = true;
    this.errorMessage = '';
    return this.ticketsApi
      .list({
        page: this.page,
        pageSize: this.pageSize,
        search: value.search || undefined,
        status: value.status || undefined,
        priority: value.priority || undefined,
        agentId: value.agentId || undefined,
        overdueOnly: !!value.overdueOnly,
      })
      .pipe(
        tap((result) => {
          if (!result.success) {
            this.items = [];
            this.totalCount = 0;
            this.errorMessage = result.message;
            return;
          }
          this.items = result.items;
          this.totalCount = result.totalCount;
          this.page = result.page;
          this.pageSize = result.pageSize;
        }),
        catchError((error) => {
          this.items = [];
          this.totalCount = 0;
          this.errorMessage = formatProblem(toApiProblem(error));
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        }),
      );
  }
}
