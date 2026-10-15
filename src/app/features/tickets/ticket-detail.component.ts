import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AgentService } from '../../core/agent.service';
import { formatProblem, toApiProblem } from '../../core/api-error';
import { AgentListItem, TicketDetail, TicketStatus } from '../../core/models';
import { TicketService } from '../../core/ticket.service';
import { statusLabel } from '../../core/ticket-status';
import { DueDateComponent } from '../../shared/due-date.component';
import { PriorityBadgeComponent } from '../../shared/priority-badge.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    DueDateComponent,
  ],
  templateUrl: './ticket-detail.component.html',
})
export class TicketDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ticketsApi = inject(TicketService);
  private readonly agentsApi = inject(AgentService);
  private readonly fb = inject(FormBuilder);

  ticket: TicketDetail | null = null;
  agents: AgentListItem[] = [];
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';
  showDeleteConfirm = false;

  readonly assignForm = this.fb.nonNullable.group({
    agentId: '',
  });

  readonly commentForm = this.fb.nonNullable.group({
    authorName: ['', [Validators.required, Validators.maxLength(200)]],
    body: ['', [Validators.required, Validators.maxLength(4000)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/tickets']);
      return;
    }

    this.agentsApi.list().subscribe({
      next: (result) => {
        if (result.success) {
          this.agents = result.items.filter((a) => a.isActive);
        }
      },
    });
    this.load(id);
  }

  get isClosed(): boolean {
    return this.ticket?.status === 'Closed';
  }

  get activeAgents(): AgentListItem[] {
    return this.agents;
  }

  statusLabel = statusLabel;

  load(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.ticketsApi.getById(id).subscribe({
      next: (ticket) => {
        if (!ticket.success) {
          this.ticket = null;
          this.errorMessage = ticket.message;
          this.loading = false;
          return;
        }
        this.applyTicket(ticket);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = formatProblem(toApiProblem(error));
        this.loading = false;
      },
    });
  }

  changeStatus(status: TicketStatus): void {
    if (!this.ticket || this.isClosed) {
      return;
    }
    this.runMutation(this.ticketsApi.changeStatus(this.ticket.id, status));
  }

  saveAssignment(): void {
    if (!this.ticket || this.isClosed) {
      return;
    }
    const agentId = this.assignForm.controls.agentId.value || null;
    this.runMutation(this.ticketsApi.assign(this.ticket.id, agentId));
  }

  addComment(): void {
    if (!this.ticket || this.isClosed || this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }
    const value = this.commentForm.getRawValue();
    this.runMutation(this.ticketsApi.addComment(this.ticket.id, value), () => {
      this.commentForm.reset({ authorName: '', body: '' });
    });
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  deleteTicket(): void {
    if (!this.ticket || this.isClosed) {
      return;
    }
    this.saving = true;
    this.ticketsApi.delete(this.ticket.id).subscribe({
      next: (result) => {
        if (!result.success) {
          this.errorMessage = result.message;
          this.saving = false;
          this.showDeleteConfirm = false;
          return;
        }
        this.router.navigate(['/tickets']);
      },
      error: (error) => {
        this.errorMessage = formatProblem(toApiProblem(error));
        this.saving = false;
        this.showDeleteConfirm = false;
      },
    });
  }

  private runMutation(request: ReturnType<TicketService['changeStatus']>, after?: () => void): void {
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    request.subscribe({
      next: (ticket) => {
        if (!ticket.success) {
          this.errorMessage = ticket.message;
          this.saving = false;
          return;
        }
        this.applyTicket(ticket);
        this.successMessage = ticket.message;
        this.saving = false;
        after?.();
      },
      error: (error) => {
        this.errorMessage = formatProblem(toApiProblem(error));
        this.saving = false;
      },
    });
  }

  private applyTicket(ticket: TicketDetail): void {
    this.ticket = ticket;
    this.assignForm.patchValue({ agentId: ticket.agentId ?? '' });
    if (ticket.status === 'Closed') {
      this.assignForm.disable();
      this.commentForm.disable();
    } else {
      this.assignForm.enable();
      this.commentForm.enable();
    }
  }
}
