import { NextResponse } from 'next/server';
import { featuredOffers } from '@/lib/offer-data';

export async function GET() {
    return NextResponse.json({
        opportunities: featuredOffers.map((offer) => ({
            ...offer,
            officialSourceUrl: offer.officialSourceUrl,
            officialApplicationUrl: offer.officialApplicationUrl,
            status: offer.status,
            verifiedAt: offer.verifiedAt,
            featured: offer.featured,
            applicationMethod: offer.applicationMethod,
            lastVerifiedAt: offer.verifiedAt,
            nextVerificationAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })),
    });
}
