import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AgentService } from '../../core/agent.service';
import { formatProblem, toApiProblem } from '../../core/api-error';
import { Department } from '../../core/models';

@Component({
  selector: 'app-agent-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './agent-form.component.html',
})
export class AgentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly agentsApi = inject(AgentService);

  readonly departments: Department[] = ['Technical', 'Billing', 'General'];
  agentId: string | null = null;
  loading = false;
  saving = false;
  errorMessage = '';
  fieldErrors: Record<string, string[]> = {};

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    department: ['Technical' as Department, Validators.required],
    isActive: [true],
  });

  get isEdit(): boolean {
    return !!this.agentId;
  }

  ngOnInit(): void {
    this.agentId = this.route.snapshot.paramMap.get('id');
    if (!this.agentId) {
      return;
    }

    this.loading = true;
    this.agentsApi.getById(this.agentId).subscribe({
      next: (agent) => {
        if (!agent.success) {
          this.errorMessage = agent.message;
          this.loading = false;
          return;
        }
        this.form.patchValue({
          fullName: agent.fullName,
          email: agent.email,
          department: agent.department,
          isActive: agent.isActive,
        });
        this.form.controls.isActive.disable();
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
    const raw = this.form.getRawValue();
    const payload = {
      fullName: raw.fullName,
      email: raw.email,
      department: raw.department,
    };

    const request$ = this.agentId
      ? this.agentsApi.update(this.agentId, payload)
      : this.agentsApi.create({ ...payload, isActive: raw.isActive });

    request$.subscribe({
      next: (agent) => {
        if (!agent.success) {
          this.errorMessage = agent.message;
          this.saving = false;
          return;
        }
        this.router.navigate(['/agents']);
      },
      error: (error) => {
        const problem = toApiProblem(error);
        this.fieldErrors = problem.errors ?? {};
        this.errorMessage = formatProblem(problem);
        this.saving = false;
      },
    });
  }

  controlError(name: 'fullName' | 'email' | 'department'): string | null {
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
