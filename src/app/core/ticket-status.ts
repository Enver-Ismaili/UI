import { TicketStatus } from './models';

const labels: Record<TicketStatus, string> = {
  New: 'New',
  InProgress: 'In Progress',
  Resolved: 'Resolved',
  Closed: 'Closed',
};

export function statusLabel(status: TicketStatus): string {
  return labels[status];
}

export function allowedStatusTargets(status: TicketStatus): TicketStatus[] {
  switch (status) {
    case 'New':
      return ['InProgress'];
    case 'InProgress':
      return ['Resolved'];
    case 'Resolved':
      return ['Closed', 'InProgress'];
    default:
      return [];
  }
}
