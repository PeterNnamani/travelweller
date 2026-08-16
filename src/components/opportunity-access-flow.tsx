"use client";

import { useEffect, useMemo, useState } from 'react';
import { featuredOffers, type OfferRecord } from '@/lib/offer-data';
import { matchOffersForProfile } from '@/modules/opportunities/offer-matching';

const SURVEY_STORAGE_KEY = 'wakawaka-offer-survey-v1';
const PAYMENT_SUCCESS_KEY = 'wakawaka-payment-success-v1';
const OPEN_OFFER_FLOW_EVENT = 'wakawaka-open-offer-flow';
const stepLabels = ['Personal Information', 'Education & Eligibility', 'Review + Offer Preview'];
const preferredCountries = [
    'United Kingdom',
    'Germany',
    'Italy',
    'Finland',
    'Sweden',
    'France',
    'Netherlands',
    'Spain',
    'Poland',
    'Ireland',
    'Denmark',
    'Belgium',
    'Austria',
    'Portugal',
];

const defaultForm = {
    fullName: '',
    email: '',
    phone: '',
    countryOfResidence: '',
    nationality: '',
    dateOfBirth: '',
    preferredCountries: [] as string[],
    opportunityType: 'Any opportunity',
    highestQualification: '',
    institution: '',
    fieldOfStudy: '',
    graduationYear: '',
    grade: '',
    desiredDegree: '',
    workExperience: '',
    yearsOfExperience: '',
    currentOccupation: '',
    preferredIntake: '',
    englishTest: 'None',
    englishScore: '',
    toeflScore: '',
    fundingPreference: 'Fully Funded',
    maxTuitionBudget: '',
    fullFundingRequired: true,
    preferredField: '',
    researchInterest: '',
};

function formatDate(date: string) {
    if (!date) return 'N/A';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(parsed);
}

function formatMoney(value?: number) {
    if (!value) return '—';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
}

export default function OpportunityAccessFlow() {
    const [isOpen, setIsOpen] = useState(true);
    const [showSurvey, setShowSurvey] = useState(false);
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedOffer, setSelectedOffer] = useState<OfferRecord | null>(null);
    const [paymentQuote, setPaymentQuote] = useState<{ amount: number; exchangeRate: number; baseAmount: number; baseCurrency: string; paymentCurrency: string } | null>(null);
    const [paymentInfo, setPaymentInfo] = useState<{ reference: string; authorizationUrl: string; amount: number; currency: string } | null>(null);
    const [isPaying, setIsPaying] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isPaystackEmbedded, setIsPaystackEmbedded] = useState(false);
    const [lastPayment, setLastPayment] = useState<{ reference: string; amount: number; date: string } | null>(null);

    useEffect(() => {
        const raw = window.localStorage.getItem(SURVEY_STORAGE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                setForm({ ...defaultForm, ...parsed, preferredCountries: parsed.preferredCountries ?? [] });
            } catch {
                // ignore invalid data
            }
        }
    }, []);

    useEffect(() => {
        const openOfferFlow = () => {
            setIsOpen(true);
            setShowSurvey(true);
        };

        window.addEventListener(OPEN_OFFER_FLOW_EVENT, openOfferFlow);
        return () => window.removeEventListener(OPEN_OFFER_FLOW_EVENT, openOfferFlow);
    }, []);

    useEffect(() => {
        window.localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(form));
    }, [form]);

    useEffect(() => {
        let active = true;
        fetch('/api/payments/application/estimate')
            .then((response) => response.json())
            .then((data) => {
                if (active && data.success) {
                    setPaymentQuote(data.payment);
                }
            })
            .catch(() => undefined);

        return () => {
            active = false;
        };
    }, []);

    const matchingOffers = useMemo(() => {
        const formattedProfile = {
            ...form,
            englishScore: form.englishTest === 'IELTS' ? Number(form.englishScore || 0) : form.englishTest === 'TOEFL' ? Number(form.toeflScore || 0) : undefined,
            preferredCountries: form.preferredCountries,
            fullFundingRequired: form.fullFundingRequired,
            desiredDegree: form.desiredDegree || form.opportunityType,
            yearsOfExperience: form.yearsOfExperience || '0',
            grant: '',
        } as any;

        return matchOffersForProfile(formattedProfile, featuredOffers as any[]).slice(0, 3);
    }, [form]);

    const nextStep = () => {
        const validationErrors = validateStep(step, form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setStep((current) => Math.min(current + 1, stepLabels.length - 1));
    };

    const previousStep = () => {
        setErrors({});
        setStep((current) => Math.max(current - 1, 0));
    };

    const handleInput = (field: string, value: string | boolean | string[]) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleCountryToggle = (country: string) => {
        setForm((current) => {
            const includes = current.preferredCountries.includes(country);
            return {
                ...current,
                preferredCountries: includes
                    ? current.preferredCountries.filter((item) => item !== country)
                    : [...current.preferredCountries, country],
            };
        });
    };

    const saveSurveyProgress = () => {
        window.localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(form));
    };

    const handlePayment = async () => {
        setIsPaying(true);
        try {
            const response = await fetch('/api/payments/application/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'guest-user', applicant: form }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Unable to initialize payment.');
            }

            setPaymentInfo({
                reference: data.reference,
                authorizationUrl: data.authorizationUrl,
                amount: data.amount,
                currency: data.currency,
            });

            if (data.authorizationUrl) {
                setIsPaystackEmbedded(true);
            }
        } catch (error) {
            setErrors({ payment: error instanceof Error ? error.message : 'Payment initialization failed.' });
        } finally {
            setIsPaying(false);
        }
    };

    const handleCompleteVerification = async () => {
        if (!paymentInfo) return;

        try {
            const response = await fetch(`/api/payments/application/verify/${paymentInfo.reference}?status=success&amount=${paymentInfo.amount}&currency=${paymentInfo.currency}&transaction_id=demo_txn_${Date.now()}`);
            const data = await response.json();
            if (data.success && data.accessStatus === 'UNLOCKED') {
                const successRecord = {
                    success: true,
                    reference: data.reference,
                    amount: data.payment?.amount ?? paymentInfo.amount,
                    currency: data.payment?.currency ?? paymentInfo.currency,
                    date: new Date().toISOString(),
                };

                window.localStorage.setItem(PAYMENT_SUCCESS_KEY, JSON.stringify(successRecord));
                setIsUnlocked(true);
                setLastPayment({ reference: data.reference, amount: data.payment?.amount ?? paymentInfo.amount, date: new Date().toISOString() });
                window.location.href = '/applications';
            }
        } catch {
            setErrors({ payment: 'Verification failed. Please try again.' });
        }
    };

    const renderStep = () => {
        if (step === 0) {
            return (
                <div className="survey-grid">
                    <div className="field-group">
                        <label>Full name</label>
                        <input value={form.fullName} onChange={(event) => handleInput('fullName', event.target.value)} placeholder="Enter full name" />
                        {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                    </div>
                    <div className="field-group">
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={(event) => handleInput('email', event.target.value)} placeholder="you@example.com" />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>
                    <div className="field-group">
                        <label>Phone number</label>
                        <input value={form.phone} onChange={(event) => handleInput('phone', event.target.value)} placeholder="+234..." />
                        {errors.phone && <span className="field-error">{errors.phone}</span>}
                    </div>
                    <div className="field-group">
                        <label>Country of residence</label>
                        <input value={form.countryOfResidence} onChange={(event) => handleInput('countryOfResidence', event.target.value)} placeholder="Nigeria" />
                        {errors.countryOfResidence && <span className="field-error">{errors.countryOfResidence}</span>}
                    </div>
                    <div className="field-group">
                        <label>Nationality</label>
                        <input value={form.nationality} onChange={(event) => handleInput('nationality', event.target.value)} placeholder="Nigerian" />
                        {errors.nationality && <span className="field-error">{errors.nationality}</span>}
                    </div>
                    <div className="field-group">
                        <label>Date of birth</label>
                        <input type="date" value={form.dateOfBirth} onChange={(event) => handleInput('dateOfBirth', event.target.value)} />
                    </div>
                    <div className="field-group field-group--full">
                        <label>Preferred countries</label>
                        <div className="checkbox-grid">
                            {preferredCountries.map((country) => (
                                <label key={country} className="check-option">
                                    <input
                                        type="checkbox"
                                        checked={form.preferredCountries.includes(country)}
                                        onChange={() => handleCountryToggle(country)}
                                    />
                                    <span>{country}</span>
                                </label>
                            ))}
                        </div>
                        {errors.preferredCountries && <span className="field-error">{errors.preferredCountries}</span>}
                    </div>
                    <div className="field-group">
                        <label>Opportunity type</label>
                        <select value={form.opportunityType} onChange={(event) => handleInput('opportunityType', event.target.value)}>
                            {['Scholarship', 'University Admission', 'Master\'s', 'Bachelor\'s', 'PhD', 'Research', 'Job', 'Internship', 'Any opportunity'].map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                </div>
            );
        }

        if (step === 1) {
            return (
                <div className="survey-grid">
                    <div className="field-group">
                        <label>Highest qualification</label>
                        <select value={form.highestQualification} onChange={(event) => handleInput('highestQualification', event.target.value)}>
                            <option value="">Select</option>
                            <option value="Bachelor's degree">Bachelor's degree</option>
                            <option value="Master's degree">Master's degree</option>
                            <option value="Doctorate">Doctorate</option>
                            <option value="Diploma">Diploma</option>
                        </select>
                        {errors.highestQualification && <span className="field-error">{errors.highestQualification}</span>}
                    </div>
                    <div className="field-group">
                        <label>Institution</label>
                        <input value={form.institution} onChange={(event) => handleInput('institution', event.target.value)} placeholder="University name" />
                    </div>
                    <div className="field-group">
                        <label>Field of study</label>
                        <input value={form.fieldOfStudy} onChange={(event) => handleInput('fieldOfStudy', event.target.value)} placeholder="Computer Science" />
                    </div>
                    <div className="field-group">
                        <label>Graduation year</label>
                        <input value={form.graduationYear} onChange={(event) => handleInput('graduationYear', event.target.value)} placeholder="2024" />
                    </div>
                    <div className="field-group">
                        <label>Grade/GPA</label>
                        <input value={form.grade} onChange={(event) => handleInput('grade', event.target.value)} placeholder="3.8 / 4.0" />
                    </div>
                    <div className="field-group">
                        <label>Desired degree</label>
                        <select value={form.desiredDegree} onChange={(event) => handleInput('desiredDegree', event.target.value)}>
                            <option value="">Select</option>
                            <option value="Master's">Master's</option>
                            <option value="Bachelor's">Bachelor's</option>
                            <option value="PhD">PhD</option>
                            <option value="Research">Research</option>
                        </select>
                    </div>
                    <div className="field-group">
                        <label>Work experience</label>
                        <input value={form.workExperience} onChange={(event) => handleInput('workExperience', event.target.value)} placeholder="2 years" />
                    </div>
                    <div className="field-group">
                        <label>Years of experience</label>
                        <input value={form.yearsOfExperience} onChange={(event) => handleInput('yearsOfExperience', event.target.value)} placeholder="2" />
                    </div>
                    <div className="field-group">
                        <label>Current occupation</label>
                        <input value={form.currentOccupation} onChange={(event) => handleInput('currentOccupation', event.target.value)} placeholder="Software engineer" />
                    </div>
                    <div className="field-group">
                        <label>Preferred intake</label>
                        <input value={form.preferredIntake} onChange={(event) => handleInput('preferredIntake', event.target.value)} placeholder="September 2026" />
                    </div>
                    <div className="field-group">
                        <label>English proficiency</label>
                        <select value={form.englishTest} onChange={(event) => handleInput('englishTest', event.target.value)}>
                            <option value="IELTS">IELTS</option>
                            <option value="TOEFL">TOEFL</option>
                            <option value="PTE">PTE</option>
                            <option value="Other">Other</option>
                            <option value="None">None</option>
                        </select>
                    </div>
                    {(form.englishTest === 'IELTS' || form.englishTest === 'TOEFL' || form.englishTest === 'PTE') && (
                        <div className="field-group">
                            <label>{form.englishTest === 'TOEFL' ? 'TOEFL score' : form.englishTest === 'PTE' ? 'PTE score' : 'IELTS overall score'}</label>
                            <input
                                type="number"
                                step="0.1"
                                value={form.englishTest === 'TOEFL' ? form.toeflScore : form.englishScore}
                                onChange={(event) =>
                                    form.englishTest === 'TOEFL'
                                        ? handleInput('toeflScore', event.target.value)
                                        : handleInput('englishScore', event.target.value)
                                }
                                placeholder={form.englishTest === 'TOEFL' ? '90' : '7.0'}
                            />
                        </div>
                    )}
                    <div className="field-group">
                        <label>Funding preference</label>
                        <select value={form.fundingPreference} onChange={(event) => handleInput('fundingPreference', event.target.value)}>
                            <option value="Fully Funded">Fully Funded</option>
                            <option value="Partially Funded">Partially Funded</option>
                            <option value="Scholarship + self-funded">Scholarship + self-funded</option>
                            <option value="Self-funded">Self-funded</option>
                        </select>
                    </div>
                    <div className="field-group">
                        <label>Maximum tuition budget</label>
                        <input value={form.maxTuitionBudget} onChange={(event) => handleInput('maxTuitionBudget', event.target.value)} placeholder="£18,000" />
                    </div>
                    <div className="field-group">
                        <label>Full funding required?</label>
                        <select value={String(form.fullFundingRequired)} onChange={(event) => handleInput('fullFundingRequired', event.target.value === 'true')}>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <div className="field-group">
                        <label>Preferred field</label>
                        <input value={form.preferredField} onChange={(event) => handleInput('preferredField', event.target.value)} placeholder="Data Science" />
                    </div>
                    <div className="field-group field-group--full">
                        <label>Research interest</label>
                        <input value={form.researchInterest} onChange={(event) => handleInput('researchInterest', event.target.value)} placeholder="AI, climate science..." />
                    </div>
                </div>
            );
        }

        return (
            <div className="review-panel">
                <div className="review-section">
                    <div className="review-header">
                        <h3>Personal Information</h3>
                        <button type="button" className="mini-button" onClick={() => setStep(0)}>Edit</button>
                    </div>
                    <ul>
                        <li><strong>Name:</strong> {form.fullName}</li>
                        <li><strong>Email:</strong> {form.email}</li>
                        <li><strong>Phone:</strong> {form.phone}</li>
                        <li><strong>Residence:</strong> {form.countryOfResidence}</li>
                        <li><strong>Nationality:</strong> {form.nationality}</li>
                        <li><strong>Destination country:</strong> {form.preferredCountries.join(', ') || 'Not selected'}</li>
                    </ul>
                </div>

                <div className="review-section">
                    <div className="review-header">
                        <h3>Education</h3>
                        <button type="button" className="mini-button" onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <ul>
                        <li><strong>Qualification:</strong> {form.highestQualification}</li>
                        <li><strong>Institution:</strong> {form.institution}</li>
                        <li><strong>Field:</strong> {form.fieldOfStudy}</li>
                        <li><strong>Desired degree:</strong> {form.desiredDegree}</li>
                        <li><strong>Funding preference:</strong> {form.fundingPreference}</li>
                    </ul>
                </div>

                <div className="review-section">
                    <div className="review-header">
                        <h3>English Test</h3>
                        <button type="button" className="mini-button" onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <ul>
                        <li><strong>Test:</strong> {form.englishTest}</li>
                        <li><strong>Score:</strong> {form.englishTest === 'TOEFL' ? form.toeflScore : form.englishScore || 'N/A'}</li>
                    </ul>
                </div>

                <div className="review-section">
                    <div className="review-header">
                        <h3>Preferences</h3>
                        <button type="button" className="mini-button" onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <ul>
                        <li><strong>Preferred field:</strong> {form.preferredField}</li>
                        <li><strong>Research interest:</strong> {form.researchInterest || 'Not provided'}</li>
                        <li><strong>Intake:</strong> {form.preferredIntake}</li>
                    </ul>
                </div>

                <div className="matching-wrap">
                    <h3>Potential matches</h3>
                    <p>Based on your profile, we found opportunities that may match your preferences.</p>
                    <div className="offer-list">
                        {matchingOffers.map((offer) => (
                            <div key={offer.id} className="offer-preview-card">
                                <div className="offer-preview-card__meta">🇩🇪 {offer.country}</div>
                                <h4>{offer.title}</h4>
                                <div>{offer.organization}</div>
                                <div><strong>Funding:</strong> {offer.funding}</div>
                                <div><strong>Deadline:</strong> {formatDate(offer.deadline)}</div>
                                <div className="offer-preview-card__match">{offer.match}% Match</div>
                                <small>{offer.matchLabel}</small>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="payment-box">
                    <div className="payment-box__amount">£100</div>
                    <div className="payment-box__label">Application & Opportunity Access Fee</div>
                    <div className="payment-box__converted">≈ {formatMoney(paymentQuote?.amount ?? 245000)}</div>
                    <p className="payment-box__disclaimer">
                        The £100 fee is a platform service/application-access fee. It does not include university application fees, tuition, visa fees, or other third-party charges.
                    </p>
                    <p className="payment-box__disclaimer">Payment does not guarantee admission, scholarship, employment, or visa approval.</p>
                    {paymentInfo && <p className="payment-box__reference">Reference: {paymentInfo.reference}</p>}
                    <button type="button" className="cta-button" onClick={handlePayment} disabled={isPaying}>
                        {isPaying ? 'Initializing...' : `Pay ${formatMoney(paymentQuote?.amount ?? 245000)} with Paystack`}
                    </button>
                    {paymentInfo && (
                        <button type="button" className="secondary-button" onClick={handleCompleteVerification}>
                            Complete demo payment verification
                        </button>
                    )}
                </div>
            </div>
        );
    };

    if (isUnlocked && lastPayment) {
        return (
            <section className="offers-cta-section">
                <div className="offers-success-box">
                    <h2>Payment Successful ✓</h2>
                    <p>Your access has been unlocked.</p>
                    <ul>
                        <li>Payment reference: {lastPayment.reference}</li>
                        <li>Amount: {formatMoney(lastPayment.amount)}</li>
                        <li>Date: {formatDate(lastPayment.date)}</li>
                    </ul>
                    <button type="button" className="cta-button" onClick={() => { window.location.href = '/applications/1'; }}>View My Offers</button>
                </div>
            </section>
        );
    }

    return (
        <>
            {isOpen && !showSurvey && (
                <div className="offers-modal-backdrop" onClick={() => setIsOpen(false)}>
                    <div className="offers-modal-shell" onClick={(event) => event.stopPropagation()}>
                        <div className="offers-modal-shell__left">
                            <div className="feature-hero__meta-line">
                                <span className="feature-hero__tag">TRAVEL TIPS</span>
                                <span className="feature-hero__tag-bar" />
                            </div>

                            <h1 className="feature-hero__title">
                                Secret Visa Strategy:<br />
                                EXCLUSIVE 1-on-1<br />
                                Migration Sessions
                            </h1>

                            <div className="feature-hero__info-row">
                                <div className="feature-hero__info-item">
                                    <span className="feature-hero__label">Written By</span>
                                    <div className="feature-hero__author-box">
                                        <span className="feature-hero__avatar">W</span>
                                        <span>WWD</span>
                                    </div>
                                </div>
                                <div className="feature-hero__info-item">
                                    <span className="feature-hero__label">Published on</span>
                                    <div className="feature-hero__date-box">
                                        <span className="feature-hero__calendar" aria-hidden="true">◔</span>
                                        <span>14th Aug, 2026</span>
                                    </div>
                                </div>
                                <div className="feature-hero__info-item">
                                    <span className="feature-hero__label">Comments By</span>
                                    <div className="feature-hero__comment-box">
                                        <span className="feature-hero__comment-icon" aria-hidden="true">◌</span>
                                        <span>0</span>
                                    </div>
                                </div>
                            </div>

                            <button className="feature-hero__cta" type="button" onClick={() => setShowSurvey(true)}>ACCESS ALL OFFERS</button>
                        </div>

                        <div className="offers-modal-shell__right">
                            <div className="offers-modal-shell__controls">
                                <span className="feature-hero__control feature-hero__control--active" />
                                <span className="feature-hero__control" />
                            </div>

                            <div className="offers-modal-shell__copy">
                                <p>
                                    Secret Visa Strategy: Discover the secret visa strategy with WakaWaka Doctor and StudyNow UK. Get free admission support, visa assistance, and exclusive 1-on-1 migration sessions.
                                </p>
                                <div className="offers-feature-card-list">
                                    {featuredOffers.slice(0, 3).map((offer) => (
                                        <div key={offer.id} className="offers-feature-card">
                                            <div className="offers-feature-card__country">🇩🇪 {offer.country}</div>
                                            <div className="offers-feature-card__title">{offer.title}</div>
                                            <div className="offers-feature-card__meta">Funding: {offer.funding}</div>
                                            <div className="offers-feature-card__meta">Deadline: {formatDate(offer.deadline)}</div>
                                            <button type="button" className="secondary-button" onClick={() => { setSelectedOffer(offer); setShowSurvey(true); }}>View Offer</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedOffer && (
                <div className="offer-modal-backdrop" onClick={() => setSelectedOffer(null)}>
                    <div className="offer-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="offer-modal__header">
                            <div>
                                <span className="offer-tag">{selectedOffer.country}</span>
                                <h3>{selectedOffer.title}</h3>
                            </div>
                            <button type="button" className="close-button" onClick={() => setSelectedOffer(null)}>×</button>
                        </div>
                        <div className="offer-modal__body">
                            <p><strong>Organization:</strong> {selectedOffer.organization}</p>
                            <p><strong>Funding:</strong> {selectedOffer.funding}</p>
                            <p><strong>Deadline:</strong> {formatDate(selectedOffer.deadline)}</p>
                            <p><strong>Eligibility:</strong> {selectedOffer.eligibility.join(', ')}</p>
                            <p><strong>Requirements:</strong> {selectedOffer.requirements.join(', ')}</p>
                            <p><strong>Application method:</strong> {selectedOffer.applicationMethod}</p>
                            <p><strong>Verification:</strong> {selectedOffer.verificationStatus} · {formatDate(selectedOffer.verifiedAt || new Date().toISOString())}</p>
                            <p>{selectedOffer.description}</p>
                            <a className="cta-button offer-modal__button" href={selectedOffer.officialApplicationUrl} target="_blank" rel="noreferrer">Access Application</a>
                        </div>
                    </div>
                </div>
            )}

            {isOpen && showSurvey && (
                <div className="survey-backdrop" onClick={() => setIsOpen(false)}>
                    <div className="survey-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="survey-modal__header">
                            <div>
                                <span className="offer-tag">Step {step + 1} of {stepLabels.length}</span>
                                <h3>{stepLabels[step]}</h3>
                            </div>
                            <button type="button" className="close-button" onClick={() => setIsOpen(false)}>×</button>
                        </div>

                        <div className="progress-bar" aria-label="Application progress">
                            {stepLabels.map((label, index) => (
                                <div key={label} className={`progress-bar__step ${index === step ? 'is-active' : ''}`}>
                                    <span>{index + 1}</span>
                                    <small>{label}</small>
                                </div>
                            ))}
                        </div>

                        <div className="survey-content">{renderStep()}</div>

                        <div className="survey-actions">
                            {step > 0 && <button type="button" className="secondary-button" onClick={previousStep}>Back</button>}
                            <button type="button" className="secondary-button" onClick={saveSurveyProgress}>Save</button>
                            {step < stepLabels.length - 1 ? (
                                <button type="button" className="cta-button" onClick={nextStep}>Continue</button>
                            ) : (
                                <button type="button" className="cta-button cta-button--wide" onClick={handlePayment} disabled={isPaying}>
                                    {isPaying ? 'Initializing...' : 'Pay Now'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isPaystackEmbedded && paymentInfo && (
                <div className="paystack-embed-backdrop" onClick={() => setIsPaystackEmbedded(false)}>
                    <div className="paystack-embed-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="paystack-embed-modal__header">
                            <div>
                                <span className="offer-tag">Secure checkout</span>
                                <h3>Paystack payment</h3>
                            </div>
                            <button type="button" className="close-button" onClick={() => setIsPaystackEmbedded(false)}>×</button>
                        </div>
                        <iframe
                            title="Paystack checkout"
                            src={paymentInfo.authorizationUrl}
                            className="paystack-embed-iframe"
                            allow="payment *"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

function validateStep(step: number, formState: typeof defaultForm) {
    const nextErrors: Record<string, string> = {};

    if (step === 0) {
        if (!formState.fullName.trim()) nextErrors.fullName = 'Please enter your full name.';
        if (!formState.email.trim()) nextErrors.email = 'Please enter your email address.';
        if (!formState.phone.trim()) nextErrors.phone = 'Please enter your phone number.';
        if (!formState.countryOfResidence.trim()) nextErrors.countryOfResidence = 'Please enter your country of residence.';
        if (!formState.nationality.trim()) nextErrors.nationality = 'Please enter your nationality.';
        if (!formState.preferredCountries.length) nextErrors.preferredCountries = 'Please select at least one destination country.';
    }

    if (step === 1) {
        if (!formState.highestQualification.trim()) nextErrors.highestQualification = 'Please select your highest qualification.';
        if (!formState.preferredField.trim()) nextErrors.preferredField = 'Please select your preferred field.';
        if (formState.englishTest === 'IELTS' && !formState.englishScore) nextErrors.englishScore = 'Please enter your IELTS score.';
        if (formState.englishTest === 'TOEFL' && !formState.toeflScore) nextErrors.toeflScore = 'Please enter your TOEFL score.';
    }

    return nextErrors;
}
