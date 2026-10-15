import { allowedStatusTargets, statusLabel } from './ticket-status';

describe('ticket-status helpers', () => {
  it('returns only allowed transitions for New and Closed', () => {
    expect(allowedStatusTargets('New')).toEqual(['InProgress']);
    expect(allowedStatusTargets('Closed')).toEqual([]);
  });

  it('formats InProgress as In Progress', () => {
    expect(statusLabel('InProgress')).toBe('In Progress');
  });
});
