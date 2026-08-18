import { recordPayment } from '@/lib/admin-tracking';

export type PaymentRecordStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type ApplicationAccessStatus = 'LOCKED' | 'UNLOCKED' | 'REVOKED';

export interface ApplicationPaymentRecord {
    id: string;
    userId: string;
    paymentReference: string;
    amount: number;
    baseAmount: number;
    baseCurrency: string;
    paymentCurrency: string;
    exchangeRate: number;
    paystackTransactionId?: string;
    status: PaymentRecordStatus;
    createdAt: string;
    paidAt?: string;
}

export interface ApplicationAccessRecord {
    id: string;
    userId: string;
    paymentId: string;
    status: ApplicationAccessStatus;
    unlockedAt?: string;
    createdAt: string;
}

const paymentStore = new Map<string, ApplicationPaymentRecord>();
const accessStore = new Map<string, ApplicationAccessRecord>();

export const APPLICATION_SERVICE_FEE_GBP = 100;

export function getCurrentGbpToNgnRate(): number {
    const monthlyRate = 2450;
    return Number((monthlyRate + 12.5).toFixed(2));
}

export function calculateApplicationFeeNgn(baseAmount = APPLICATION_SERVICE_FEE_GBP): number {
    const rate = getCurrentGbpToNgnRate();
    return Math.round(baseAmount * rate);
}

export function resolveAuthenticatedUserId(request: Request, fallbackUserId?: string): string {
    const authHeader = request.headers.get('authorization');
    const xUserId = request.headers.get('x-user-id') ?? fallbackUserId;

    if (xUserId) return xUserId;
    if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.replace('Bearer ', '').trim();

    return 'guest-user';
}

export function getPaymentByReference(reference: string): ApplicationPaymentRecord | undefined {
    return paymentStore.get(reference);
}

export function createPaymentRecord(input: {
    userId: string;
    paymentReference: string;
    amount: number;
    baseAmount: number;
    baseCurrency: string;
    paymentCurrency: string;
    exchangeRate: number;
    paystackTransactionId?: string;
}) {
    const payment: ApplicationPaymentRecord = {
        id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId: input.userId,
        paymentReference: input.paymentReference,
        amount: input.amount,
        baseAmount: input.baseAmount,
        baseCurrency: input.baseCurrency,
        paymentCurrency: input.paymentCurrency,
        exchangeRate: input.exchangeRate,
        paystackTransactionId: input.paystackTransactionId,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
    };

    paymentStore.set(payment.paymentReference, payment);
    return payment;
}

export function finalizeSuccessfulPayment(reference: string, providerTransactionId?: string): {
    payment: ApplicationPaymentRecord | undefined;
    access: ApplicationAccessRecord | undefined;
    success: boolean;
} {
    const payment = paymentStore.get(reference);
    if (!payment) {
        return { payment: undefined, access: undefined, success: false };
    }

    if (payment.status === 'SUCCESS') {
        const access = accessStore.get(payment.id) ?? {
            id: `access_${payment.id}`,
            userId: payment.userId,
            paymentId: payment.id,
            status: 'UNLOCKED',
            unlockedAt: payment.paidAt ?? new Date().toISOString(),
            createdAt: payment.createdAt,
        };
        accessStore.set(payment.id, access);

        void recordPayment({
            userId: payment.userId,
            amount: payment.amount,
            currency: payment.paymentCurrency,
            reference: payment.paymentReference,
            source: 'application-payment',
            status: 'success',
        }).catch(() => undefined);

        return {
            payment,
            access,
            success: true,
        };
    }

    payment.status = 'SUCCESS';
    payment.paystackTransactionId = providerTransactionId ?? payment.paystackTransactionId;
    payment.paidAt = new Date().toISOString();

    const access: ApplicationAccessRecord = {
        id: `access_${payment.id}`,
        userId: payment.userId,
        paymentId: payment.id,
        status: 'UNLOCKED',
        unlockedAt: payment.paidAt,
        createdAt: payment.createdAt,
    };

    accessStore.set(payment.id, access);

    void recordPayment({
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.paymentCurrency,
        reference: payment.paymentReference,
        source: 'application-payment',
        status: 'success',
    }).catch(() => undefined);

    return { payment, access, success: true };
}

export function getAccessForUser(userId: string): ApplicationAccessRecord | undefined {
    for (const access of accessStore.values()) {
        if (access.userId === userId && access.status === 'UNLOCKED') return access;
    }

    return undefined;
}

export function verifyPaystackTransactionServerSide(input: {
    status: string;
    amount: number;
    currency: string;
    reference: string;
    transactionId: string;
    expectedAmount: number;
    expectedCurrency: string;
    expectedReference: string;
}) {
    const errors: string[] = [];
    const normalizedAmount = Number(input.amount) >= 1000 ? Number(input.amount) / 100 : Number(input.amount);

    if (input.status !== 'success' && input.status !== 'SUCCESS') {
        errors.push('Transaction is not successful.');
    }

    if (normalizedAmount !== Number(input.expectedAmount)) {
        errors.push('Amount mismatch.');
    }

    if ((input.currency ?? '').toUpperCase() !== (input.expectedCurrency ?? '').toUpperCase()) {
        errors.push('Currency mismatch.');
    }

    if (input.reference !== input.expectedReference) {
        errors.push('Reference mismatch.');
    }

    if (!input.transactionId) {
        errors.push('Transaction ID missing.');
    }

    return {
        isValid: errors.length === 0,
        errors,
        paymentStatus: errors.length === 0 ? 'paid' : 'failed',
        providerTransactionId: input.transactionId,
    };
}
