"use client";

import { useEffect, useMemo, useState } from 'react';
import { featuredOffers, type OfferRecord } from '@/lib/offer-data';

const PAYMENT_SUCCESS_KEY = 'wakawaka-payment-success-v1';

export default function ApplicationsPage() {
    const [paymentSuccess, setPaymentSuccess] = useState<{ success: boolean; reference: string; amount: number; currency: string; date: string } | null>(null);
    const [offers, setOffers] = useState<OfferRecord[]>(featuredOffers);

    useEffect(() => {
        const raw = window.localStorage.getItem(PAYMENT_SUCCESS_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                setPaymentSuccess(parsed);
            } catch {
                // ignore invalid cache
            }
        }
    }, []);

    const visibleOffers = useMemo(() => offers, [offers]);

    return (
        <main className="applications-page">
            <section className="applications-page__header">
                <div>
                    <span className="offer-tag">Access granted</span>
                    <h1>My opportunities</h1>
                </div>
                <a href="/" className="secondary-button">Back to home</a>
            </section>

            {paymentSuccess && (
                <div className="applications-page__success">
                    <h2>Payment successful ✓</h2>
                    <p>
                        Your application access has been unlocked. Payment reference: <strong>{paymentSuccess.reference}</strong>
                    </p>
                    <p>
                        Amount: <strong>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: paymentSuccess.currency || 'NGN', maximumFractionDigits: 0 }).format(paymentSuccess.amount)}</strong>
                    </p>
                </div>
            )}

            <section className="offers-grid">
                {visibleOffers.map((offer) => (
                    <article key={offer.id} className="offers-grid__card">
                        <div className="offers-grid__meta">{offer.country}</div>
                        <h3>{offer.title}</h3>
                        <div className="offers-grid__field">Organization: {offer.organization}</div>
                        <div className="offers-grid__field">Funding: {offer.funding}</div>
                        <div className="offers-grid__field">Deadline: {new Date(offer.deadline).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</div>
                        <p>{offer.description}</p>
                        <a href={offer.officialApplicationUrl} target="_blank" rel="noreferrer" className="cta-button offer-modal__button">
                            Apply on official site
                        </a>
                    </article>
                ))}
            </section>
        </main>
    );
}
