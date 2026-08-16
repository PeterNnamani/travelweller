export interface StudentProfileInput {
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

export class StudentProfileService {
    static normalize(input: StudentProfileInput) {
        return {
            ...input,
            fullName: input.fullName.trim(),
            email: input.email?.trim().toLowerCase(),
            phone: input.phone?.trim(),
            educationHistory: input.educationHistory ?? [],
            englishLanguageTests: input.englishLanguageTests ?? []
        };
    }

    static validate(input: StudentProfileInput): string[] {
        const errors: string[] = [];

        if (!input.fullName || input.fullName.trim().length < 2) {
            errors.push('Full name is required.');
        }

        if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
            errors.push('A valid email is required.');
        }

        return errors;
    }
}
