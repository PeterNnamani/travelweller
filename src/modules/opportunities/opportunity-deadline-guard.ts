export type OpportunityDeadlineStatus =
    | 'active'
    | 'deadline-passed'
    | 'deadline-within-7-days'
    | 'deadline-within-30-days'
    | 'admin-reopened';

export interface OpportunityDeadlineInput {
    deadline: Date;
    reopenedByAdmin?: boolean;
    now?: Date;
}

export interface DeadlineEvaluationResult {
    allowed: boolean;
    status: OpportunityDeadlineStatus;
    daysRemaining: number;
}

export class OpportunityDeadlineGuard {
    private readonly DAY_IN_MS = 24 * 60 * 60 * 1000;

    evaluate({ deadline, reopenedByAdmin = false, now = new Date() }: OpportunityDeadlineInput): DeadlineEvaluationResult {
        const diffMs = deadline.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffMs / this.DAY_IN_MS);

        if (reopenedByAdmin) {
            return {
                allowed: true,
                status: 'admin-reopened',
                daysRemaining
            };
        }

        if (diffMs < 0) {
            return {
                allowed: false,
                status: 'deadline-passed',
                daysRemaining
            };
        }

        if (daysRemaining <= 7) {
            return {
                allowed: true,
                status: 'deadline-within-7-days',
                daysRemaining
            };
        }

        if (daysRemaining <= 30) {
            return {
                allowed: true,
                status: 'deadline-within-30-days',
                daysRemaining
            };
        }

        return {
            allowed: true,
            status: 'active',
            daysRemaining
        };
    }
}
