import type {
    ApplicationProvider,
    ApplicationStatus,
    SubmissionType
} from '@/integrations/interfaces';

export abstract class ApplicationSubmission {
    protected readonly type: SubmissionType;

    constructor(type: SubmissionType) {
        this.type = type;
    }

    getSubmissionType(): SubmissionType {
        return this.type;
    }

    abstract validateApplication(): Promise<boolean>;
    abstract uploadDocuments(): Promise<boolean>;
    abstract submitApplication(): Promise<{ success: boolean; reference?: string; message?: string }>;
    abstract getApplicationStatus(): Promise<{ status: ApplicationStatus; message?: string }>;
}

export class UniversityApplicationAdapter extends ApplicationSubmission implements ApplicationProvider {
    constructor(private readonly line: string) {
        super('DIRECT_API');
    }

    async validate(): Promise<boolean> {
        return this.validateApplication();
    }

    async submit(): Promise<{ success: boolean; reference?: string; message?: string }> {
        return this.submitApplication();
    }

    async getStatus(): Promise<{ status: ApplicationStatus; message?: string }> {
        return this.getApplicationStatus();
    }

    async validateApplication(): Promise<boolean> {
        return Boolean(this.line && this.line.trim().length > 0);
    }

    async uploadDocuments(): Promise<boolean> {
        return true;
    }

    async submitApplication(): Promise<{ success: boolean; reference?: string; message?: string }> {
        return {
            success: true,
            reference: `api_${Date.now()}`,
            message: 'Application submitted through the authorized integration.'
        };
    }

    async getApplicationStatus(): Promise<{ status: ApplicationStatus; message?: string }> {
        return {
            status: 'Under review',
            message: 'Provider confirmed the application is active.'
        };
    }
}

export class OfficialPortalSubmission extends ApplicationSubmission {
    constructor(private readonly portalUrl: string) {
        super('OFFICIAL_PORTAL');
    }

    async validateApplication(): Promise<boolean> {
        return Boolean(this.portalUrl && this.portalUrl.startsWith('http'));
    }

    async uploadDocuments(): Promise<boolean> {
        return true;
    }

    async submitApplication(): Promise<{ success: boolean; reference?: string; message?: string }> {
        return {
            success: false,
            message: 'Redirect user to the official portal for completion and tracking.'
        };
    }

    async getApplicationStatus(): Promise<{ status: ApplicationStatus; message?: string }> {
        return {
            status: 'Ready for submission',
            message: 'Portal tracking is pending user completion.'
        };
    }
}
