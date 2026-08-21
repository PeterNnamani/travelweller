import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getDashboardSnapshot, recordLead, recordVisit } from './admin-tracking';

const tempFiles: string[] = [];

afterEach(async () => {
    await Promise.all(
        tempFiles.map(async (filePath) => {
            try {
                await fs.rm(filePath, { force: true });
            } catch {
                // ignore cleanup errors
            }
        }),
    );
    tempFiles.length = 0;
});

describe('admin tracking', () => {
    it('groups rapid visits into a session and keeps later revisits under the same device', async () => {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wakawaka-admin-'));
        const storePath = path.join(tempDir, 'activity.json');
        tempFiles.push(storePath);
        const firstVisit = new Date('2026-08-01T10:00:00.000Z');

        await recordVisit({ deviceId: 'device-1', source: 'homepage', pagePath: '/', ipAddress: '203.0.113.10', location: 'Lagos, NG', storePath, now: firstVisit });
        await recordVisit({ deviceId: 'device-1', source: 'offers', pagePath: '/offers', storePath, now: new Date(firstVisit.getTime() + 5 * 60 * 1000) });
        await recordVisit({ deviceId: 'device-1', source: 'homepage', pagePath: '/', storePath, now: new Date(firstVisit.getTime() + 36 * 60 * 1000) });

        const snapshot = await getDashboardSnapshot({ storePath, now: new Date('2026-08-01T11:00:00.000Z') });
        const sessions = snapshot.entries.filter((entry) => entry.type === 'visit');

        expect(sessions).toHaveLength(2);
        expect(sessions[0].pageViews).toHaveLength(1);
        expect(sessions[1].pageViews).toHaveLength(2);
        expect(sessions[1].ipAddress).toBe('203.0.113.10');
        expect(sessions[1].location).toBe('Lagos, NG');
        expect(sessions[0].deviceId).toBe(sessions[1].deviceId);
    });

    it('keeps leads and visit events for five days and counts active leads', async () => {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wakawaka-admin-'));
        const storePath = path.join(tempDir, 'activity.json');
        tempFiles.push(storePath);

        const visitTime = new Date('2026-08-01T10:00:00.000Z');
        const leadTime = new Date('2026-08-02T11:30:00.000Z');
        const snapshotTime = new Date('2026-08-05T17:00:00.000Z');

        await recordVisit({
            source: 'homepage',
            referrer: 'https://example.com',
            userAgent: 'Mozilla/5.0',
            storePath,
            now: visitTime,
        });

        await recordLead({
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            acceptedTerms: true,
            source: 'newsletter',
            storePath,
            now: leadTime,
        });

        const snapshot = await getDashboardSnapshot({ storePath, now: snapshotTime });

        expect(snapshot.totalVisitors).toBe(1);
        expect(snapshot.totalLeads).toBe(1);
        expect(snapshot.activeLeads).toBe(1);
        expect(snapshot.entries.length).toBe(2);
        expect(snapshot.entries.every((entry) => new Date(entry.expiresAt) > snapshotTime)).toBe(true);
    });

    it('rejects invalid lead submissions', async () => {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wakawaka-admin-'));
        const storePath = path.join(tempDir, 'activity.json');
        tempFiles.push(storePath);

        await expect(
            recordLead({
                firstName: '',
                lastName: 'Lovelace',
                email: 'ada@example.com',
                acceptedTerms: false,
                source: 'newsletter',
                storePath,
            }),
        ).rejects.toThrow(/valid/i);
    });
});
