import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_STORE_PATH = path.join(process.cwd(), 'data', 'admin-tracking.json');
const RETENTION_MS = 5 * 24 * 60 * 60 * 1000;
const SESSION_WINDOW_MS = 30 * 60 * 1000;

// Initialize Supabase client only if credentials are available
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    : null;

export type TrackingEventType = 'visit' | 'lead' | 'payment';

export type TrackingEvent = {
    id: string;
    type: TrackingEventType;
    createdAt: string;
    expiresAt: string;
    source: string;
    referrer?: string;
    userAgent?: string;
    deviceId?: string;
    sessionId?: string;
    ipAddress?: string;
    location?: string;
    firstSeenAt?: string;
    lastSeenAt?: string;
    pageViews?: Array<{ path: string; source: string; visitedAt: string }>;
    firstName?: string;
    lastName?: string;
    email?: string;
    acceptedTerms?: boolean;
    userId?: string;
    amount?: number;
    currency?: string;
    reference?: string;
    status?: 'pending' | 'success' | 'failed';
};

export type DashboardSnapshot = {
    totalVisitors: number;
    totalLeads: number;
    activeLeads: number;
    totalSuccessfulPayments: number;
    walletBalance: number;
    walletCurrency: string;
    entries: TrackingEvent[];
    generatedAt: string;
};

type StoreData = {
    events: TrackingEvent[];
};

const ensureStoreFile = async (storePath = DEFAULT_STORE_PATH) => {
    const directory = path.dirname(storePath);
    await fs.mkdir(directory, { recursive: true });

    try {
        const existing = await fs.readFile(storePath, 'utf8');
        const parsed = JSON.parse(existing) as Partial<StoreData>;
        if (Array.isArray(parsed.events)) {
            return parsed as StoreData;
        }
    } catch {
        // ignore parse errors and initialize clean store
    }

    const freshStore: StoreData = { events: [] };
    await fs.writeFile(storePath, JSON.stringify(freshStore, null, 2), 'utf8');
    return freshStore;
};

const pruneExpiredEvents = (events: TrackingEvent[], now = new Date()) =>
    events.filter((event) => new Date(event.expiresAt).getTime() > now.getTime());

const createExpiryTime = (now = new Date()) => new Date(now.getTime() + RETENTION_MS).toISOString();

const toTrackingEvent = (record: {
    id: string;
    type: string;
    source: string;
    referrer?: string | null;
    user_agent?: string | null;
    device_id?: string | null;
    session_id?: string | null;
    ip_address?: string | null;
    location?: string | null;
    first_seen_at?: string | Date | null;
    last_seen_at?: string | Date | null;
    page_views?: Array<{ path: string; source: string; visitedAt: string }> | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    accepted_terms?: boolean | null;
    user_id?: string | null;
    amount?: number | string | { toString(): string } | null;
    currency?: string | null;
    reference?: string | null;
    status?: string | null;
    created_at: string | Date;
    expires_at: string | Date;
}): TrackingEvent => {
    const amountValue = record.amount == null ? undefined : Number(typeof record.amount === 'object' ? record.amount.toString() : record.amount);

    return {
        id: record.id,
        type: record.type as TrackingEventType,
        createdAt: new Date(record.created_at).toISOString(),
        expiresAt: new Date(record.expires_at).toISOString(),
        source: record.source,
        referrer: record.referrer ?? undefined,
        userAgent: record.user_agent ?? undefined,
        deviceId: record.device_id ?? undefined,
        sessionId: record.session_id ?? undefined,
        ipAddress: record.ip_address ?? undefined,
        location: record.location ?? undefined,
        firstSeenAt: record.first_seen_at ? new Date(record.first_seen_at).toISOString() : undefined,
        lastSeenAt: record.last_seen_at ? new Date(record.last_seen_at).toISOString() : undefined,
        pageViews: record.page_views ?? undefined,
        firstName: record.first_name ?? undefined,
        lastName: record.last_name ?? undefined,
        email: record.email ?? undefined,
        acceptedTerms: record.accepted_terms ?? undefined,
        userId: record.user_id ?? undefined,
        amount: Number.isFinite(amountValue) ? amountValue : undefined,
        currency: record.currency ?? undefined,
        reference: record.reference ?? undefined,
        status: (record.status as 'pending' | 'success' | 'failed') ?? undefined,
    };
};

const useDatabase = () => Boolean(supabase);

export async function recordVisit(options: {
    source?: string;
    referrer?: string;
    userAgent?: string;
    deviceId?: string;
    ipAddress?: string;
    location?: string;
    pagePath?: string;
    storePath?: string;
    now?: Date;
}) {
    const timestamp = options.now ?? new Date();
    const storePath = options.storePath ?? DEFAULT_STORE_PATH;

    if (useDatabase()) {
        try {
            const { data: current, error: lookupError } = await supabase!
                .from('admin_events')
                .select('*')
                .eq('type', 'visit')
                .eq('device_id', options.deviceId ?? '')
                .gt('last_seen_at', new Date(timestamp.getTime() - SESSION_WINDOW_MS).toISOString())
                .order('last_seen_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (lookupError) throw lookupError;

            const pageView = { path: options.pagePath ?? options.source ?? 'direct', source: options.source ?? 'direct', visitedAt: timestamp.toISOString() };
            const existing = current ? toTrackingEvent(current) : undefined;
            const payload: Record<string, unknown> = existing
                ? {
                    last_seen_at: timestamp.toISOString(),
                    expires_at: new Date(timestamp.getTime() + RETENTION_MS).toISOString(),
                    page_views: [...(existing.pageViews ?? []), pageView],
                    source: options.source ?? existing.source,
                    referrer: options.referrer ?? existing.referrer ?? null,
                    ip_address: options.ipAddress ?? existing.ipAddress ?? null,
                    location: options.location ?? existing.location ?? null,
                }
                : {
                    type: 'visit',
                    source: options.source ?? 'direct',
                    referrer: options.referrer ?? null,
                    user_agent: options.userAgent ?? null,
                    device_id: options.deviceId ?? null,
                    session_id: `session-${crypto.randomUUID()}`,
                    ip_address: options.ipAddress ?? null,
                    location: options.location ?? null,
                    first_seen_at: timestamp.toISOString(),
                    last_seen_at: timestamp.toISOString(),
                    page_views: [pageView],
                    created_at: timestamp.toISOString(),
                    expires_at: new Date(timestamp.getTime() + RETENTION_MS).toISOString(),
                };

            const result = existing
                ? await supabase!.from('admin_events').update(payload).eq('id', existing.id).select().single()
                : await supabase!.from('admin_events').insert(payload).select().single();
            const { data, error } = result;

            if (error) throw error;
            return toTrackingEvent(data);
        } catch (err) {
            console.warn('[admin-tracking] Supabase visit failed, falling back to file:', err);
            // Fall through to file storage
        }
    }

    const store = await ensureStoreFile(storePath);
    const deviceId = options.deviceId ?? 'legacy-anonymous-device';
    const latestSession = [...store.events]
        .filter((event) => event.type === 'visit' && event.deviceId === deviceId)
        .sort((a, b) => new Date(b.lastSeenAt ?? b.createdAt).getTime() - new Date(a.lastSeenAt ?? a.createdAt).getTime())[0];
    const latestSeen = latestSession ? new Date(latestSession.lastSeenAt ?? latestSession.createdAt).getTime() : 0;
    const pageView = { path: options.pagePath ?? options.source ?? 'direct', source: options.source ?? 'direct', visitedAt: timestamp.toISOString() };

    if (latestSession && timestamp.getTime() - latestSeen <= SESSION_WINDOW_MS) {
        const updatedSession: TrackingEvent = {
            ...latestSession,
            lastSeenAt: timestamp.toISOString(),
            expiresAt: createExpiryTime(timestamp),
            pageViews: [...(latestSession.pageViews ?? []), pageView],
            source: options.source ?? latestSession.source,
            referrer: options.referrer ?? latestSession.referrer,
            ipAddress: options.ipAddress ?? latestSession.ipAddress,
            location: options.location ?? latestSession.location,
        };
        const nextEvents = pruneExpiredEvents(store.events.map((event) => event.id === latestSession.id ? updatedSession : event), timestamp);
        await fs.writeFile(storePath, JSON.stringify({ events: nextEvents }, null, 2), 'utf8');
        return updatedSession;
    }

    const event: TrackingEvent = {
        id: `visit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'visit',
        createdAt: timestamp.toISOString(),
        expiresAt: createExpiryTime(timestamp),
        source: options.source ?? 'direct',
        referrer: options.referrer,
        userAgent: options.userAgent,
        deviceId,
        sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ipAddress: options.ipAddress,
        location: options.location,
        firstSeenAt: timestamp.toISOString(),
        lastSeenAt: timestamp.toISOString(),
        pageViews: [pageView],
    };

    const nextEvents = pruneExpiredEvents([...store.events, event], timestamp);
    await fs.writeFile(storePath, JSON.stringify({ events: nextEvents }, null, 2), 'utf8');

    return event;
}

export async function recordLead(options: {
    firstName: string;
    lastName: string;
    email: string;
    acceptedTerms: boolean;
    source?: string;
    storePath?: string;
    now?: Date;
}) {
    const timestamp = options.now ?? new Date();
    const storePath = options.storePath ?? DEFAULT_STORE_PATH;

    if (!options.firstName?.trim() || !options.lastName?.trim() || !options.email?.trim()) {
        throw new Error('Please provide valid first name, last name, and email.');
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(options.email.trim());
    if (!emailIsValid) {
        throw new Error('Please provide a valid email address.');
    }

    if (!options.acceptedTerms) {
        throw new Error('You must accept the terms and privacy policy to continue.');
    }

    if (useDatabase()) {
        try {
            const { data, error } = await supabase!
                .from('admin_events')
                .insert({
                    type: 'lead',
                    source: options.source ?? 'newsletter',
                    first_name: options.firstName.trim(),
                    last_name: options.lastName.trim(),
                    email: options.email.trim(),
                    accepted_terms: true,
                    created_at: timestamp.toISOString(),
                    expires_at: new Date(timestamp.getTime() + RETENTION_MS).toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            return toTrackingEvent(data);
        } catch (err) {
            console.warn('[admin-tracking] Supabase lead failed, falling back to file:', err);
            // Fall through to file storage
        }
    }

    const store = await ensureStoreFile(storePath);
    const event: TrackingEvent = {
        id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'lead',
        createdAt: timestamp.toISOString(),
        expiresAt: createExpiryTime(timestamp),
        source: options.source ?? 'newsletter',
        firstName: options.firstName.trim(),
        lastName: options.lastName.trim(),
        email: options.email.trim(),
        acceptedTerms: true,
    };

    const nextEvents = pruneExpiredEvents([...store.events, event], timestamp);
    await fs.writeFile(storePath, JSON.stringify({ events: nextEvents }, null, 2), 'utf8');

    return event;
}

export async function recordPayment(options: {
    userId: string;
    amount: number;
    currency?: string;
    reference: string;
    source?: string;
    status?: 'pending' | 'success' | 'failed';
    storePath?: string;
    now?: Date;
}) {
    const timestamp = options.now ?? new Date();
    const storePath = options.storePath ?? DEFAULT_STORE_PATH;

    if (useDatabase()) {
        try {
            const { data, error } = await supabase!
                .from('admin_events')
                .insert({
                    type: 'payment',
                    source: options.source ?? 'application',
                    user_id: options.userId,
                    amount: Number(options.amount) || 0,
                    currency: options.currency ?? 'NGN',
                    reference: options.reference,
                    status: options.status ?? 'success',
                    created_at: timestamp.toISOString(),
                    expires_at: new Date(timestamp.getTime() + RETENTION_MS).toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            return toTrackingEvent(data);
        } catch (err) {
            console.warn('[admin-tracking] Supabase payment failed, falling back to file:', err);
            // Fall through to file storage
        }
    }

    const store = await ensureStoreFile(storePath);
    const existing = store.events.find((event) => event.type === 'payment' && event.reference === options.reference);
    if (existing) {
        return existing;
    }

    const event: TrackingEvent = {
        id: `payment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'payment',
        createdAt: timestamp.toISOString(),
        expiresAt: createExpiryTime(timestamp),
        source: options.source ?? 'application',
        userId: options.userId,
        amount: Number(options.amount) || 0,
        currency: options.currency ?? 'NGN',
        reference: options.reference,
        status: options.status ?? 'success',
    };

    const nextEvents = pruneExpiredEvents([...store.events, event], timestamp);
    await fs.writeFile(storePath, JSON.stringify({ events: nextEvents }, null, 2), 'utf8');

    return event;
}

export async function getDashboardSnapshot(options?: { storePath?: string; now?: Date }): Promise<DashboardSnapshot> {
    const storePath = options?.storePath ?? DEFAULT_STORE_PATH;
    const now = options?.now ?? new Date();

    if (useDatabase()) {
        try {
            console.log('[getDashboardSnapshot] Querying Supabase for events...');
            const { data, error } = await supabase!
                .from('admin_events')
                .select('*')
                .gt('expires_at', now.toISOString())
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[getDashboardSnapshot] Supabase error:', error);
                throw error;
            }

            console.log('[getDashboardSnapshot] Supabase query returned:', data?.length ?? 0, 'events');
            const mappedEvents = (data || []).map((event) => {
                const mapped = toTrackingEvent(event);
                console.log('[getDashboardSnapshot] Mapped event:', mapped);
                return mapped;
            });

            const successfulPaymentEvents = mappedEvents.filter((event) => event.type === 'payment' && event.status === 'success');

            const snapshot: DashboardSnapshot = {
                totalVisitors: mappedEvents.filter((event) => event.type === 'visit').length,
                totalLeads: mappedEvents.filter((event) => event.type === 'lead').length,
                activeLeads: mappedEvents.filter((event) => event.type === 'lead').length,
                totalSuccessfulPayments: successfulPaymentEvents.length,
                walletBalance: successfulPaymentEvents.reduce((sum, event) => sum + (Number(event.amount) || 0), 0),
                walletCurrency: 'NGN',
                entries: mappedEvents,
                generatedAt: now.toISOString(),
            };

            console.log('[getDashboardSnapshot] Returning snapshot:', snapshot);
            return snapshot;
        } catch (err) {
            console.warn('[admin-tracking] Supabase snapshot failed, falling back to file:', err);
            // Fall through to file storage
        }
    }

    const store = await ensureStoreFile(storePath);
    const events = pruneExpiredEvents(store.events, now);

    const totalVisitors = events.filter((event) => event.type === 'visit').length;
    const totalLeads = events.filter((event) => event.type === 'lead').length;
    const activeLeads = events.filter((event) => event.type === 'lead').length;
    const successfulPaymentEvents = events.filter((event) => event.type === 'payment' && event.status === 'success');
    const totalSuccessfulPayments = successfulPaymentEvents.length;
    const walletBalance = successfulPaymentEvents.reduce((sum, event) => sum + (Number(event.amount) || 0), 0);

    const payload: DashboardSnapshot = {
        totalVisitors,
        totalLeads,
        activeLeads,
        totalSuccessfulPayments,
        walletBalance,
        walletCurrency: 'NGN',
        entries: events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        generatedAt: now.toISOString(),
    };

    await fs.writeFile(storePath, JSON.stringify({ events }, null, 2), 'utf8');

    return payload;
}
