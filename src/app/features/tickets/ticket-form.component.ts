import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { formatProblem, toApiProblem } from '../../core/api-error';
import { Priority } from '../../core/models';
import { TicketService } from '../../core/ticket.service';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-form.component.html',
})
export class TicketFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ticketsApi = inject(TicketService);

  readonly priorities: Priority[] = ['Low', 'Normal', 'High', 'Critical'];
  ticketId: string | null = null;
  loading = false;
  saving = false;
  errorMessage = '';
  fieldErrors: Record<string, string[]> = {};

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
    customerName: ['', [Validators.required, Validators.maxLength(200)]],
    customerEmail: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    priority: ['Normal' as Priority, Validators.required],
  });

  get isEdit(): boolean {
    return !!this.ticketId;
  }

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id');
    if (!this.ticketId) {
      return;
    }

    this.loading = true;
    this.ticketsApi.getById(this.ticketId).subscribe({
      next: (ticket) => {
        if (!ticket.success) {
          this.errorMessage = ticket.message;
          this.loading = false;
          return;
        }
        if (ticket.status === 'Closed') {
          this.router.navigate(['/tickets', ticket.id]);
          return;
        }
        this.form.patchValue({
          title: ticket.title,
          description: ticket.description,
          customerName: ticket.customerName,
          customerEmail: ticket.customerEmail,
          priority: ticket.priority,
        });
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = formatProblem(toApiProblem(error));
        this.loading = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.fieldErrors = {};
    const payload = this.form.getRawValue();
    const request$ = this.ticketId
      ? this.ticketsApi.update(this.ticketId, payload)
      : this.ticketsApi.create(payload);

    request$.subscribe({
      next: (ticket) => {
        if (!ticket.success) {
          this.errorMessage = ticket.message;
          this.saving = false;
          return;
        }
        this.router.navigate(['/tickets', ticket.id]);
      },
      error: (error) => {
        const problem = toApiProblem(error);
        this.fieldErrors = problem.errors ?? {};
        this.errorMessage = formatProblem(problem);
        this.saving = false;
      },
    });
  }

  controlError(name: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[name];
    if (!(control.touched && control.invalid)) {
      return this.fieldErrors[name]?.[0] ?? null;
    }
    if (control.hasError('required')) {
      return 'This field is required.';
    }
    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }
    if (control.hasError('maxlength')) {
      return 'Value is too long.';
    }
    return this.fieldErrors[name]?.[0] ?? 'Invalid value.';
  }
}
