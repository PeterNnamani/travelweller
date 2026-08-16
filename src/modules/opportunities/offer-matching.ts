export type OpportunityMatchKind =
    | 'Scholarship'
    | 'University Admission'
    | 'Master\'s'
    | 'Bachelor\'s'
    | 'PhD'
    | 'Research'
    | 'Job'
    | 'Internship'
    | 'Any opportunity';

export interface ApplicantProfile {
    fullName: string;
    email: string;
    phone: string;
    countryOfResidence: string;
    nationality: string;
    dateOfBirth: string;
    preferredCountries: string[];
    opportunityType: string;
    highestQualification: string;
    institution: string;
    fieldOfStudy: string;
    graduationYear: string;
    grade: string;
    desiredDegree: string;
    workExperience: string;
    yearsOfExperience: string;
    currentOccupation: string;
    preferredIntake: string;
    englishTest: string;
    englishScore?: number;
    fundingPreference: string;
    maxTuitionBudget: string;
    fullFundingRequired: boolean;
    preferredField: string;
    researchInterest?: string;
}

export interface OfferMatchInput {
    id: string;
    title: string;
    organization: string;
    country: string;
    city: string;
    opportunityType: string;
    degree: string;
    funding: string;
    currency: string;
    deadline: string;
    description: string;
    eligibility: string[];
    requirements: string[];
    officialApplicationUrl: string;
    officialSourceUrl: string;
    verificationStatus: string;
    verifiedAt?: string;
    featured?: boolean;
    status: string;
    applicationMethod: string;
    field: string;
    academicLevel: string;
}

export interface OfferMatchResult extends OfferMatchInput {
    match: number;
    matchLabel: string;
}

function normalize(value: string): string {
    return value.toLowerCase().trim();
}

export function matchOffersForProfile(profile: ApplicantProfile, offers: OfferMatchInput[]): OfferMatchResult[] {
    return offers
        .map((offer) => {
            const scoreParts: number[] = [];

            if (profile.preferredCountries.length > 0 && profile.preferredCountries.some((country) => normalize(country) === normalize(offer.country))) {
                scoreParts.push(22);
            }

            if (profile.opportunityType && profile.opportunityType !== 'Any opportunity') {
                const sameOpportunity = normalize(profile.opportunityType) === normalize(offer.opportunityType) || normalize(profile.opportunityType) === normalize(offer.degree);
                if (sameOpportunity) scoreParts.push(20);
            }

            if (profile.preferredField && normalize(profile.preferredField) === normalize(offer.field)) {
                scoreParts.push(18);
            }

            if (profile.desiredDegree && normalize(profile.desiredDegree) === normalize(offer.degree)) {
                scoreParts.push(15);
            }

            if (profile.fundingPreference && normalize(profile.fundingPreference) === normalize(offer.funding)) {
                scoreParts.push(10);
            }

            if (profile.englishTest && profile.englishTest !== 'None') {
                const threshold = profile.englishTest === 'IELTS' ? 6.5 : profile.englishTest === 'TOEFL' ? 80 : profile.englishTest === 'PTE' ? 58 : 0;
                if (typeof profile.englishScore === 'number' && profile.englishScore >= threshold) {
                    scoreParts.push(10);
                }
            }

            if (profile.yearsOfExperience && Number(profile.yearsOfExperience) > 0) {
                scoreParts.push(5);
            }

            const match = Math.min(96, Math.max(55, scoreParts.reduce((sum, value) => sum + value, 0)));
            let matchLabel = 'Possible match based on your profile.';

            if (match >= 85) {
                matchLabel = 'Potential match based on your profile.';
            } else if (match >= 70) {
                matchLabel = 'Potential match based on your profile.';
            } else if (match >= 60) {
                matchLabel = 'Possible match based on your profile.';
            }

            return {
                ...offer,
                match: Math.round(match),
                matchLabel,
            };
        })
        .sort((a, b) => b.match - a.match);
}
