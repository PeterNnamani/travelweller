import { NextResponse } from 'next/server';
import { getDashboardSnapshot } from '@/lib/admin-tracking';

export async function GET() {
    try {
        const snapshot = await getDashboardSnapshot();

        // Disable caching so data is always fresh
        return NextResponse.json(snapshot, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        console.error('[snapshot] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to load snapshot' },
            { status: 500 }
        );
    }
}
