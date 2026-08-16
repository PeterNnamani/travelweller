export type OfferStatus = 'OPEN' | 'CLOSING SOON' | 'CLOSED';

export interface OfferRecord {
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
    verifiedAt: string;
    featured: boolean;
    status: OfferStatus;
    applicationMethod: 'DIRECT_API' | 'OFFICIAL_PORTAL' | 'ASSISTED' | 'MANUAL';
    field: string;
    academicLevel: string;
}

export const featuredOffers: OfferRecord[] = [
    {
        id: 'deu-masters-cs',
        title: 'Fully Funded Master\'s Opportunity',
        organization: 'Technical University of Munich',
        country: 'Germany',
        city: 'Munich',
        opportunityType: 'Scholarship',
        degree: 'Master\'s',
        funding: 'Fully Funded',
        currency: 'EUR',
        deadline: '2026-09-30T00:00:00.000Z',
        description: 'A fully funded master\'s scholarship for students pursuing advanced computer science and AI study in Germany.',
        eligibility: ['Bachelor\'s degree in relevant field', 'Strong academic record', 'English proficiency'],
        requirements: ['CV', 'Academic transcripts', 'Statement of purpose', 'Reference letters'],
        officialApplicationUrl: 'https://www.tum.de/en/studies/application/master/',
        officialSourceUrl: 'https://www.tum.de/',
        verificationStatus: 'Verified',
        verifiedAt: '2026-08-01T00:00:00.000Z',
        featured: true,
        status: 'OPEN',
        applicationMethod: 'OFFICIAL_PORTAL',
        field: 'Computer Science',
        academicLevel: 'Master\'s'
    },
    {
        id: 'uk-phd-ai',
        title: 'AI PhD Studentship',
        organization: 'University of Edinburgh',
        country: 'United Kingdom',
        city: 'Edinburgh',
        opportunityType: 'PhD',
        degree: 'PhD',
        funding: '£22,000/year',
        currency: 'GBP',
        deadline: '2026-10-15T00:00:00.000Z',
        description: 'Research-based PhD in AI with funding support and supervised research in machine learning and data systems.',
        eligibility: ['Master\'s degree or equivalent', 'Strong quantitative background', 'Research capability'],
        requirements: ['CV', 'Research proposal', 'Academic references'],
        officialApplicationUrl: 'https://www.ed.ac.uk/studying/postgraduate/research-degrees',
        officialSourceUrl: 'https://www.ed.ac.uk',
        verificationStatus: 'Verified',
        verifiedAt: '2026-08-04T00:00:00.000Z',
        featured: true,
        status: 'OPEN',
        applicationMethod: 'OFFICIAL_PORTAL',
        field: 'Artificial Intelligence',
        academicLevel: 'PhD'
    },
    {
        id: 'fr-fellowship-research',
        title: 'Climate Research Fellowship',
        organization: 'European Research Council',
        country: 'France',
        city: 'Paris',
        opportunityType: 'Research',
        degree: 'Research Fellowship',
        funding: '€2,200/month',
        currency: 'EUR',
        deadline: '2026-08-30T00:00:00.000Z',
        description: 'Research fellowship for climate policy and sustainability projects across European institutions.',
        eligibility: ['Master\'s degree or equivalent', 'Research experience preferred'],
        requirements: ['Proposal', 'CV', 'Proof of degree'],
        officialApplicationUrl: 'https://erc.europa.eu/funding',
        officialSourceUrl: 'https://erc.europa.eu/',
        verificationStatus: 'Verified',
        verifiedAt: '2026-08-09T00:00:00.000Z',
        featured: false,
        status: 'CLOSING SOON',
        applicationMethod: 'OFFICIAL_PORTAL',
        field: 'Climate Science',
        academicLevel: 'Research'
    },
    {
        id: 'se-job-software',
        title: 'Software Engineer Role',
        organization: 'Nordic Tech Labs',
        country: 'Sweden',
        city: 'Stockholm',
        opportunityType: 'Job',
        degree: 'Engineering',
        funding: 'SEK 420,000/year',
        currency: 'SEK',
        deadline: '2026-11-15T00:00:00.000Z',
        description: 'Skilled software engineer role for building distributed systems and cloud products in Stockholm.',
        eligibility: ['Degree in software engineering or equivalent', 'Work authorization'],
        requirements: ['Portfolio', 'CV', 'Work samples'],
        officialApplicationUrl: 'https://www.nordictechlabs.example/jobs',
        officialSourceUrl: 'https://www.nordictechlabs.example/',
        verificationStatus: 'Verified',
        verifiedAt: '2026-08-12T00:00:00.000Z',
        featured: false,
        status: 'OPEN',
        applicationMethod: 'OFFICIAL_PORTAL',
        field: 'Software Engineering',
        academicLevel: 'Professional'
    },
    {
        id: 'fi-internship-data',
        title: 'Data Internship',
        organization: 'University of Helsinki',
        country: 'Finland',
        city: 'Helsinki',
        opportunityType: 'Internship',
        degree: 'Internship',
        funding: '€1,100/month',
        currency: 'EUR',
        deadline: '2026-09-12T00:00:00.000Z',
        description: 'Internship opportunity for data analysis, visualization and applied AI research.',
        eligibility: ['Current student or recent graduate', 'Analytical skills'],
        requirements: ['Transcript', 'Cover letter'],
        officialApplicationUrl: 'https://www.helsinki.fi/en/open-positions',
        officialSourceUrl: 'https://www.helsinki.fi/',
        verificationStatus: 'Verified',
        verifiedAt: '2026-08-06T00:00:00.000Z',
        featured: false,
        status: 'OPEN',
        applicationMethod: 'MANUAL',
        field: 'Data Science',
        academicLevel: 'Internship'
    }
];

export function getOfferStatus(deadline: string): OfferStatus {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    const daysLeft = diff / (1000 * 60 * 60 * 24);

    if (daysLeft <= 0) return 'CLOSED';
    if (daysLeft <= 7) return 'CLOSING SOON';
    return 'OPEN';
}
