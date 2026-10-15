import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblem } from './models';

export function toApiProblem(error: unknown): ApiProblem {
  if (!(error instanceof HttpErrorResponse)) {
    return { title: 'Unexpected error', detail: 'Something went wrong.' };
  }

  const body = error.error;
  if (body && typeof body === 'object') {
    return {
      title: body.title ?? error.statusText,
      detail: body.detail ?? body.title ?? 'Request failed.',
      status: body.status ?? error.status,
      code: body.code ?? body.extensions?.code,
      errors: body.errors,
    };
  }

  return {
    title: error.statusText || 'Request failed',
    detail: typeof body === 'string' && body ? body : 'Request failed.',
    status: error.status,
  };
}

export function formatProblem(problem: ApiProblem): string {
  if (problem.errors) {
    const messages = Object.values(problem.errors).flat();
    if (messages.length) {
      return messages.join(' ');
    }
  }

  return problem.detail || problem.title || 'Request failed.';
}
