import { describe, expect, it } from 'vitest';
import { matchOffersForProfile, type ApplicantProfile } from './offer-matching';

describe('offer matching', () => {
    it('returns strongly ranked matches using country, field, degree, and funding preference', () => {
        const profile: ApplicantProfile = {
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            phone: '+2348000000000',
            countryOfResidence: 'Nigeria',
            nationality: 'Nigerian',
            dateOfBirth: '1998-03-20',
            preferredCountries: ['Germany', 'United Kingdom'],
            opportunityType: 'Master\'s',
            highestQualification: 'Bachelor\'s degree',
            institution: 'University of Lagos',
            fieldOfStudy: 'Computer Science',
            graduationYear: '2024',
            grade: '3.7',
            desiredDegree: 'Master\'s',
            workExperience: '1 year',
            yearsOfExperience: '1',
            currentOccupation: 'Software Engineer',
            preferredIntake: 'September 2026',
            englishTest: 'IELTS',
            englishScore: 7.5,
            fundingPreference: 'Fully Funded',
            maxTuitionBudget: '0',
            fullFundingRequired: true,
            preferredField: 'Computer Science',
            researchInterest: ''
        };

        const offers = [
            {
                id: 'op-1',
                title: 'Computer Science Master\'s Scholarship',
                organization: 'Technical University of Munich',
                country: 'Germany',
                city: 'Munich',
                opportunityType: 'Scholarship',
                degree: 'Master\'s',
                funding: 'Fully Funded',
                currency: 'EUR',
                deadline: '2026-09-30T00:00:00.000Z',
                description: 'Fully funded master\'s scholarship',
                eligibility: ['Degree in CS'],
                requirements: ['CV', 'Transcript'],
                officialApplicationUrl: 'https://example.com/apply',
                officialSourceUrl: 'https://example.com/source',
                verificationStatus: 'Verified',
                verifiedAt: '2026-08-01T00:00:00.000Z',
                featured: true,
                status: 'OPEN',
                applicationMethod: 'OFFICIAL_PORTAL',
                field: 'Computer Science',
                academicLevel: 'Master\'s'
            },
            {
                id: 'op-2',
                title: 'Mechanical Engineering PhD',
                organization: 'University of Bologna',
                country: 'Italy',
                city: 'Bologna',
                opportunityType: 'PhD',
                degree: 'PhD',
                funding: '€1,500/month',
                currency: 'EUR',
                deadline: '2026-12-01T00:00:00.000Z',
                description: 'Research role',
                eligibility: ['STEM degree'],
                requirements: ['Research proposal'],
                officialApplicationUrl: 'https://example.com/phd',
                officialSourceUrl: 'https://example.com/phd-source',
                verificationStatus: 'Verified',
                verifiedAt: '2026-08-10T00:00:00.000Z',
                featured: false,
                status: 'OPEN',
                applicationMethod: 'OFFICIAL_PORTAL',
                field: 'Mechanical Engineering',
                academicLevel: 'PhD'
            }
        ];

        const results = matchOffersForProfile(profile, offers);

        expect(results[0].id).toBe('op-1');
        expect(results[0].match).toBeGreaterThan(80);
        expect(results[0].matchLabel).toContain('Potential match');
    });
});
