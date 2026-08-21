import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { recordLead, recordVisit } from '@/lib/admin-tracking';

const DEVICE_COOKIE = 'wakawaka_device_id';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const source = typeof body?.source === 'string' ? body.source : 'direct';
        const referrer = typeof body?.referrer === 'string' ? body.referrer : undefined;
        const userAgent = typeof body?.userAgent === 'string' ? body.userAgent : undefined;
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ipAddress = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined;
        const city = request.headers.get('x-vercel-ip-city');
        const region = request.headers.get('x-vercel-ip-country-region');
        const country = request.headers.get('x-vercel-ip-country');
        const location = [city, region, country].filter(Boolean).join(', ') || undefined;
        const deviceId = request.cookies.get(DEVICE_COOKIE)?.value || randomUUID();

        if (body?.type === 'lead') {
            const lead = await recordLead({
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                acceptedTerms: Boolean(body.acceptedTerms),
                source,
            });

            return NextResponse.json({ success: true, lead });
        }

        const visit = await recordVisit({ source, referrer, userAgent, deviceId, ipAddress, location, pagePath: source });
        const response = NextResponse.json({ success: true, visit });
        if (!request.cookies.get(DEVICE_COOKIE)) {
            response.cookies.set(DEVICE_COOKIE, deviceId, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 365,
                path: '/',
            });
        }
        return response;
    } catch (error) {
        console.error('[admin/track] Error:', error);
        const message = error instanceof Error ? error.message : 'Unable to record visit.';
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}
