'use client';

import { useEffect, useMemo, useState } from 'react';

type DashboardEntry = {
    id: string;
    type: 'visit' | 'lead' | 'payment';
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

type DashboardSnapshot = {
    totalVisitors: number;
    totalLeads: number;
    activeLeads: number;
    totalSuccessfulPayments: number;
    walletBalance: number;
    walletCurrency: string;
    generatedAt: string;
    entries: DashboardEntry[];
};

const formatMoney = (value: number, currency = 'NGN') =>
    new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);

const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));

const sections = ['Overview', 'Visitors', 'Leads', 'Payments', 'Wallet'];

export default function AdminDashboardPage() {
    const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('Overview');
    const [expandedSession, setExpandedSession] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadSnapshot = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/admin/snapshot', {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: Unable to load admin data.`);
                }

                const payload = (await response.json()) as DashboardSnapshot;
                console.log('[AdminDashboard] Snapshot loaded:', payload);
                if (isMounted) {
                    setSnapshot(payload);
                    setError('');
                }
            } catch (loadError) {
                console.error('[AdminDashboard] Error loading snapshot:', loadError);
                if (isMounted) {
                    setError(loadError instanceof Error ? loadError.message : 'Unknown error.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void loadSnapshot();
        const refreshTimer = window.setInterval(() => {
            console.log('[AdminDashboard] Refreshing snapshot...');
            void loadSnapshot();
        }, 5000); // Refresh every 5 seconds for live updates

        return () => {
            isMounted = false;
            window.clearInterval(refreshTimer);
        };
    }, []);

    const leadRows = useMemo(() => (snapshot?.entries ?? []).filter((entry) => entry.type === 'lead'), [snapshot]);
    const visitorRows = useMemo(() => (snapshot?.entries ?? []).filter((entry) => entry.type === 'visit'), [snapshot]);
    const paymentRows = useMemo(() => (snapshot?.entries ?? []).filter((entry) => entry.type === 'payment'), [snapshot]);

    const renderOverview = () => (
        <>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px', marginBottom: '28px' }}>
                <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: '0 12px 26px rgba(17,24,39,0.06)' }}>
                    <div style={{ fontSize: '0.74rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Total visitors</div>
                    <h2 style={{ fontSize: '2.2rem', margin: '12px 0 0' }}>{snapshot?.totalVisitors ?? 0}</h2>
                </div>

                <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: '0 12px 26px rgba(17,24,39,0.06)' }}>
                    <div style={{ fontSize: '0.74rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Leads captured</div>
                    <h2 style={{ fontSize: '2.2rem', margin: '12px 0 0' }}>{snapshot?.totalLeads ?? 0}</h2>
                </div>

                <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: '0 12px 26px rgba(17,24,39,0.06)' }}>
                    <div style={{ fontSize: '0.74rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Successful payments</div>
                    <h2 style={{ fontSize: '2.2rem', margin: '12px 0 0' }}>{snapshot?.totalSuccessfulPayments ?? 0}</h2>
                </div>

                <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: '0 12px 26px rgba(17,24,39,0.06)' }}>
                    <div style={{ fontSize: '0.74rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Wallet balance</div>
                    <h2 style={{ fontSize: '1.8rem', margin: '12px 0 0' }}>{formatMoney(snapshot?.walletBalance ?? 0, snapshot?.walletCurrency ?? 'NGN')}</h2>
                </div>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px', marginBottom: '26px' }}>
                <div style={{ background: '#fff', borderRadius: '18px', padding: '22px', boxShadow: '0 12px 26px rgba(17,24,39,0.06)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '18px' }}>Recent leads</h3>
                    {leadRows.length === 0 ? (
                        <p style={{ margin: 0, color: '#6b7280' }}>No leads captured yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {leadRows.slice(0, 5).map((entry) => (
                                <div key={entry.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', background: '#fafafa' }}>
                                    <strong>{entry.firstName} {entry.lastName}</strong>
                                    <div style={{ color: '#4b5563', marginTop: '6px' }}>{entry.email}</div>
                                    <div style={{ color: '#6b7280', marginTop: '6px', fontSize: '0.8rem' }}>{entry.source} • {formatDate(entry.createdAt)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ background: '#fff', borderRadius: '18px', padding: '22px', boxShadow: '0 12px 26px rgba(17,24,39,0.06)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '18px' }}>Recent payments</h3>
                    {paymentRows.length === 0 ? (
                        <p style={{ margin: 0, color: '#6b7280' }}>No successful payments recorded yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {paymentRows.slice(0, 5).map((entry) => (
                                <div key={entry.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', background: '#fafafa' }}>
                                    <div><strong>{entry.userId}</strong></div>
                                    <div style={{ color: '#4b5563', marginTop: '6px' }}>{formatMoney(entry.amount ?? 0, entry.currency ?? 'NGN')}</div>
                                    <div style={{ color: '#6b7280', marginTop: '6px', fontSize: '0.8rem' }}>{entry.reference} • {formatDate(entry.createdAt)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );

    const renderVisitors = () => (
        <section style={{ background: '#fff', borderRadius: '18px', padding: '22px', boxShadow: '0 12px 26px rgba(17,24,39,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Visitor sessions</h3>
                    <p style={{ color: '#6b7280', margin: '6px 0 18px' }}>One row per device session. Sessions close after 30 minutes of inactivity.</p>
                </div>
                <strong style={{ color: '#ef6c00' }}>{visitorRows.length} sessions</strong>
            </div>
            {visitorRows.length === 0 ? <p style={{ color: '#6b7280', margin: 0 }}>No visitor activity yet.</p> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                                <th style={{ padding: '10px 12px' }}>Visitor / session</th>
                                <th style={{ padding: '10px 12px' }}>Location</th>
                                <th style={{ padding: '10px 12px' }}>IP address</th>
                                <th style={{ padding: '10px 12px' }}>Last seen</th>
                                <th style={{ padding: '10px 12px' }}>Pages</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitorRows.map((entry) => {
                                const deviceSessions = visitorRows.filter((candidate) => candidate.deviceId && candidate.deviceId === entry.deviceId);
                                const sessionCount = deviceSessions.length;
                                const visitCount = deviceSessions.reduce((total, session) => total + (session.pageViews?.length ?? 1), 0);
                                const pages = entry.pageViews ?? [{ path: entry.source, source: entry.source, visitedAt: entry.createdAt }];
                                const isExpanded = expandedSession === entry.id;
                                return (
                                    <tr key={entry.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}>
                                            <button type="button" onClick={() => setExpandedSession(isExpanded ? null : entry.id)} style={{ border: 0, background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer', color: '#111827' }}>
                                                <strong>{sessionCount > 1 ? 'Returning visitor' : 'New visitor'}</strong>
                                                <div style={{ color: '#6b7280', fontSize: '0.76rem', marginTop: '4px' }}>{entry.deviceId ? `${entry.deviceId.slice(0, 12)}...` : 'Legacy visitor'} · {visitCount} visits · {sessionCount} sessions · first seen {formatDate(entry.firstSeenAt ?? entry.createdAt)}</div>
                                            </button>
                                        </td>
                                        <td style={{ padding: '12px' }} title={entry.location || 'Location was not available when this visit was recorded'}>{entry.location || 'Unknown location'}</td>
                                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>{entry.ipAddress || 'Unknown IP'}</td>
                                        <td style={{ padding: '12px' }}>{formatDate(entry.lastSeenAt ?? entry.createdAt)}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button type="button" onClick={() => setExpandedSession(isExpanded ? null : entry.id)} style={{ border: '1px solid #d1d5db', borderRadius: '8px', background: isExpanded ? '#fff7ed' : '#fff', padding: '7px 10px', cursor: 'pointer', color: '#374151' }}>{pages.length} viewed</button>
                                            {isExpanded ? <div style={{ marginTop: '10px', color: '#4b5563', fontSize: '0.8rem', lineHeight: 1.7 }}>{pages.map((page, index) => <div key={`${page.visitedAt}-${index}`}><strong>{page.path}</strong> · {formatDate(page.visitedAt)}</div>)}</div> : null}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );

    const renderLeads = () => (
        <section style={{ background: '#fff', borderRadius: '18px', padding: '22px', boxShadow: '0 12px 26px rgba(17,24,39,0.06)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Lead submissions</h3>
            {leadRows.length === 0 ? <p style={{ color: '#6b7280', margin: 0 }}>No signups yet.</p> : (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {leadRows.map((entry) => (
                        <div key={entry.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', background: '#fafafa' }}>
                            <strong>{entry.firstName} {entry.lastName}</strong>
                            <div style={{ color: '#4b5563', marginTop: '6px' }}>{entry.email}</div>
                            <div style={{ color: '#6b7280', marginTop: '6px', fontSize: '0.8rem' }}>{entry.source} • {formatDate(entry.createdAt)}</div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );

    const renderPayments = () => (
        <section style={{ background: '#fff', borderRadius: '18px', padding: '22px', boxShadow: '0 12px 26px rgba(17,24,39,0.06)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Paid applicants</h3>
            {paymentRows.length === 0 ? <p style={{ color: '#6b7280', margin: 0 }}>No completed payments yet.</p> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '10px 12px' }}>User</th>
                                <th style={{ padding: '10px 12px' }}>Reference</th>
                                <th style={{ padding: '10px 12px' }}>Amount</th>
                                <th style={{ padding: '10px 12px' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentRows.map((entry) => (
                                <tr key={entry.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px 12px' }}>{entry.userId}</td>
                                    <td style={{ padding: '10px 12px' }}>{entry.reference}</td>
                                    <td style={{ padding: '10px 12px' }}>{formatMoney(entry.amount ?? 0, entry.currency ?? 'NGN')}</td>
                                    <td style={{ padding: '10px 12px' }}>{formatDate(entry.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );

    const renderWallet = () => (
        <section style={{ background: '#fff', borderRadius: '18px', padding: '22px', boxShadow: '0 12px 26px rgba(17,24,39,0.06)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '18px' }}>Wallet summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px', background: '#f9fafb' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Available balance</div>
                    <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{formatMoney(snapshot?.walletBalance ?? 0, snapshot?.walletCurrency ?? 'NGN')}</h2>
                </div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px', background: '#f9fafb' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Paid applicants</div>
                    <h2 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{snapshot?.totalSuccessfulPayments ?? 0}</h2>
                </div>
            </div>
        </section>
    );

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'Visitors':
                return renderVisitors();
            case 'Leads':
                return renderLeads();
            case 'Payments':
                return renderPayments();
            case 'Wallet':
                return renderWallet();
            default:
                return renderOverview();
        }
    };

    return (
        <main style={{ padding: '32px 20px 60px', background: 'linear-gradient(180deg, #fffaf5 0%, #f3f6f8 100%)', minHeight: '100vh', color: '#111827' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#ef6c00', fontWeight: 700, fontSize: '0.76rem' }}>
                                Admin panel
                            </p>
                            <h1 style={{ margin: '10px 0 0', fontSize: 'clamp(2rem, 3vw, 3rem)' }}>Operations dashboard</h1>
                        </div>
                        <div style={{ position: 'sticky', top: 0, zIndex: 10, border: '1px solid #e5e7eb', borderRadius: '14px', background: 'rgba(255,255,255,0.94)', padding: '6px 8px', display: 'flex', flexWrap: 'wrap', gap: '6px', boxShadow: '0 8px 20px rgba(17,24,39,0.06)' }}>
                            {sections.map((section, index) => (
                                <button
                                    key={section}
                                    type="button"
                                    onClick={() => setActiveSection(section)}
                                    style={{
                                        border: 'none',
                                        background: activeSection === section ? '#111827' : '#f3f4f6',
                                        color: activeSection === section ? '#fff' : '#374151',
                                        borderRadius: '999px',
                                        padding: '10px 14px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span aria-hidden="true" style={{ marginRight: '6px' }}>{['◉', '⌁', '◆', '↗', '₦'][index]}</span>{section}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {error ? (
                    <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '14px 16px', borderRadius: '12px', color: '#9f1239', marginBottom: '20px' }}>
                        {error}
                    </div>
                ) : null}

                {loading && !snapshot ? (
                    <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 14px 28px rgba(17,24,39,0.06)' }}>
                        Loading tracking data...
                    </div>
                ) : (
                    renderActiveSection()
                )}

            </div>
        </main>
    );
}
