"use client";

export default function OfferNavTrigger() {
    return (
        <button
            type="button"
            className="topbar__cta"
            onClick={() => {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('wakawaka-open-offer-flow'));
                }
            }}
        >
            ACCESS OFFERS
        </button>
    );
}
