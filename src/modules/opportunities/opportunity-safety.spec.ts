import { describe, expect, it } from 'vitest';
import { OpportunityDeadlineGuard } from './opportunity-deadline-guard';

describe('OpportunityDeadlineGuard', () => {
    it('blocks applications when the official deadline has already passed and no admin override exists', () => {
        const guard = new OpportunityDeadlineGuard();
        const result = guard.evaluate({
            deadline: new Date('2024-01-10T00:00:00.000Z'),
            reopenedByAdmin: false,
            now: new Date('2024-01-11T00:00:00.000Z')
        });

        expect(result.allowed).toBe(false);
        expect(result.status).toBe('deadline-passed');
    });

    it('allows a reopened opportunity after the deadline with explicit admin override', () => {
        const guard = new OpportunityDeadlineGuard();
        const result = guard.evaluate({
            deadline: new Date('2024-01-10T00:00:00.000Z'),
            reopenedByAdmin: true,
            now: new Date('2024-01-11T00:00:00.000Z')
        });

        expect(result.allowed).toBe(true);
        expect(result.status).toBe('admin-reopened');
    });

    it('flags opportunities approaching deadline within 7 days', () => {
        const guard = new OpportunityDeadlineGuard();
        const result = guard.evaluate({
            deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            reopenedByAdmin: false,
            now: new Date()
        });

        expect(result.allowed).toBe(true);
        expect(result.status).toBe('deadline-within-7-days');
    });
});
