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
import { AgentListItem } from '../../core/models';

@Component({
  selector: 'app-agent-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './agent-list.component.html',
})
export class AgentListComponent implements OnInit {
  private readonly agentsApi = inject(AgentService);
  private readonly fb = inject(FormBuilder);

  agents: AgentListItem[] = [];
  loading = false;
  savingId: string | null = null;
  errorMessage = '';
  successMessage = '';
  deleteTarget: AgentListItem | null = null;

  readonly filters = this.fb.nonNullable.group({
    search: '',
  });

  ngOnInit(): void {
    this.filters.controls.search.valueChanges
      .pipe(
        startWith(this.filters.controls.search.value),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((search) => this.fetch(search)),
      )
      .subscribe();
  }

  toggleActive(agent: AgentListItem): void {
    this.savingId = agent.id;
    this.errorMessage = '';
    this.successMessage = '';
    this.agentsApi.setActive(agent.id, !agent.isActive).subscribe({
      next: (updated) => {
        if (!updated.success) {
          this.errorMessage = updated.message;
          this.savingId = null;
          return;
        }
        this.agents = this.agents.map((a) =>
          a.id === updated.id
            ? {
                id: updated.id,
                fullName: updated.fullName,
                email: updated.email,
                department: updated.department,
                isActive: updated.isActive,
              }
            : a,
        );
        this.successMessage = updated.message;
        this.savingId = null;
      },
      error: (error) => {
        this.errorMessage = formatProblem(toApiProblem(error));
        this.savingId = null;
      },
    });
  }

  confirmDelete(agent: AgentListItem): void {
    this.deleteTarget = agent;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  deleteAgent(): void {
    if (!this.deleteTarget) {
      return;
    }

    const target = this.deleteTarget;
    this.savingId = target.id;
    this.errorMessage = '';
    this.successMessage = '';
    this.agentsApi.delete(target.id).subscribe({
      next: (result) => {
        if (!result.success) {
          this.errorMessage = result.message;
          this.deleteTarget = null;
          this.savingId = null;
          return;
        }
        this.agents = this.agents.filter((a) => a.id !== target.id);
        this.successMessage = result.message;
        this.deleteTarget = null;
        this.savingId = null;
      },
      error: (error) => {
        this.errorMessage = formatProblem(toApiProblem(error));
        this.deleteTarget = null;
        this.savingId = null;
      },
    });
  }

  private fetch(search: string) {
    this.loading = true;
    this.errorMessage = '';
    return this.agentsApi.list(search).pipe(
      tap((result) => {
        if (!result.success) {
          this.agents = [];
          this.errorMessage = result.message;
          return;
        }
        this.agents = result.items;
      }),
      catchError((error) => {
        this.agents = [];
        this.errorMessage = formatProblem(toApiProblem(error));
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      }),
    );
  }
}
