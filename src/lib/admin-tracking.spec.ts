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
