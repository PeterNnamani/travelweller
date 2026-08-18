import { NextRequest, NextResponse } from 'next/server';
import { recordLead, recordVisit } from '@/lib/admin-tracking';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const source = typeof body?.source === 'string' ? body.source : 'direct';
        const referrer = typeof body?.referrer === 'string' ? body.referrer : undefined;
        const userAgent = typeof body?.userAgent === 'string' ? body.userAgent : undefined;

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

        const visit = await recordVisit({ source, referrer, userAgent });
        return NextResponse.json({ success: true, visit });
    } catch (error) {
        console.error('[admin/track] Error:', error);
        const message = error instanceof Error ? error.message : 'Unable to record visit.';
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}
