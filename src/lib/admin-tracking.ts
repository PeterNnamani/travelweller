import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_STORE_PATH = path.join(process.cwd(), 'data', 'admin-tracking.json');
const RETENTION_MS = 5 * 24 * 60 * 60 * 1000;

export type TrackingEventType = 'visit' | 'lead' | 'payment';

export type TrackingEvent = {
    id: string;
    type: TrackingEventType;
    createdAt: string;
    expiresAt: string;
    source: string;
    referrer?: string;
    userAgent?: string;
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

export async function recordVisit(options: {
    source?: string;
    referrer?: string;
    userAgent?: string;
    storePath?: string;
    now?: Date;
}) {
    const timestamp = options.now ?? new Date();
    const storePath = options.storePath ?? DEFAULT_STORE_PATH;
    const store = await ensureStoreFile(storePath);
    const event: TrackingEvent = {
        id: `visit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'visit',
        createdAt: timestamp.toISOString(),
        expiresAt: createExpiryTime(timestamp),
        source: options.source ?? 'direct',
        referrer: options.referrer,
        userAgent: options.userAgent,
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
