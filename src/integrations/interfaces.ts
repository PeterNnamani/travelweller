export type DegreeLevel = 'Bachelor' | 'Master' | 'PhD' | 'Foundation' | 'Diploma';
export type SubmissionType = 'DIRECT_API' | 'OFFICIAL_PORTAL' | 'ASSISTED' | 'MANUAL';
export type ApplicationStatus =
    | 'Draft'
    | 'Payment pending'
    | 'Paid'
    | 'Preparing'
    | 'Documents incomplete'
    | 'Ready for submission'
    | 'Submitted'
    | 'Under review'
    | 'Offer received'
    | 'Rejected'
    | 'Withdrawn';

export type OpportunityDeadlineStatus =
    | 'active'
    | 'deadline-passed'
    | 'deadline-within-7-days'
    | 'deadline-within-30-days'
    | 'admin-reopened';

export interface OpportunityRecord {
    id: string;
    universityName: string;
    country: string;
    city: string;
    universityWebsite: string;
    programName: string;
    degreeLevel: DegreeLevel;
    fieldOfStudy: string;
    intake: string;
    applicationDeadline: Date;
    tuitionFee: number;
    currency: string;
    scholarshipAvailable: boolean;
    scholarshipName?: string;
    scholarshipValue?: number;
    eligibilityRequirements?: string[];
    academicRequirements?: string[];
    englishLanguageRequirements?: string[];
    requiredDocuments?: string[];
    applicationMethod: 'DIRECT_API' | 'OFFICIAL_PORTAL' | 'ASSISTED' | 'MANUAL';
    officialApplicationUrl: string;
    apiIntegrationStatus: 'none' | 'available' | 'partial' | 'deprecated';
    source: string;
    sourceUrl: string;
    sourceName: string;
    lastVerifiedAt: Date;
    nextVerificationAt: Date;
    isActive: boolean;
}

export interface StudentProfile {
    id: string;
    fullName: string;
    dateOfBirth?: Date;
    nationality?: string;
    countryOfResidence?: string;
    email?: string;
    phone?: string;
    address?: string;
    passportNumber?: string;
    passportIssueDate?: Date;
    passportExpiryDate?: Date;
    passportCountryOfIssue?: string;
    educationHistory?: string[];
    englishLanguageTests?: Array<{ testName: string; score: string; testDate?: Date }>;
}

export interface OpportunityProvider {
    search(query: string): Promise<OpportunityRecord[]>;
    getOpportunity(id: string): Promise<OpportunityRecord | null>;
    getRequirements(id: string): Promise<string[]>;
    getDeadlines(id: string): Promise<{ deadline: Date; status: OpportunityDeadlineStatus }>;
    sync(): Promise<boolean>;
    getApplicationMethod(id: string): Promise<SubmissionType>;
}

export interface ApplicationProvider {
    validate(): Promise<boolean>;
    submit(): Promise<{ success: boolean; reference?: string; message?: string }>;
    getStatus(): Promise<{ status: ApplicationStatus; message?: string }>;
}
