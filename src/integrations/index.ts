export * from './interfaces';

export class UCASProvider {
    async search() {
        return [];
    }

    async getOpportunity() {
        return null;
    }

    async getRequirements() {
        return [];
    }

    async getDeadlines() {
        return { deadline: new Date(), status: 'active' as const };
    }

    async sync() {
        return true;
    }

    async getApplicationMethod() {
        return 'OFFICIAL_PORTAL' as const;
    }
}

export class DAADProvider {
    async search() {
        return [];
    }

    async getOpportunity() {
        return null;
    }

    async getRequirements() {
        return [];
    }

    async getDeadlines() {
        return { deadline: new Date(), status: 'active' as const };
    }

    async sync() {
        return true;
    }

    async getApplicationMethod() {
        return 'OFFICIAL_PORTAL' as const;
    }
}

export class UniversityProvider {
    async search() {
        return [];
    }

    async getOpportunity() {
        return null;
    }

    async getRequirements() {
        return [];
    }

    async getDeadlines() {
        return { deadline: new Date(), status: 'active' as const };
    }

    async sync() {
        return true;
    }

    async getApplicationMethod() {
        return 'ASSISTED' as const;
    }
}

export class ScholarshipProvider {
    async search() {
        return [];
    }

    async getOpportunity() {
        return null;
    }

    async getRequirements() {
        return [];
    }

    async getDeadlines() {
        return { deadline: new Date(), status: 'active' as const };
    }

    async sync() {
        return true;
    }

    async getApplicationMethod() {
        return 'OFFICIAL_PORTAL' as const;
    }
}
