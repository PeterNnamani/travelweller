import { describe, expect, it } from 'vitest';
import { PaymentVerificationService } from './application-payment';

describe('PaymentVerificationService', () => {
    it('accepts a verified Paystack payment only when amount, currency, and reference all match', () => {
        const service = new PaymentVerificationService();

        const result = service.verifyTransaction({
            status: 'success',
            amount: 10000,
            currency: 'NGN',
            reference: 'app_ref_123',
            transactionId: 'paystack_txn_1',
            expectedAmount: 10000,
            expectedCurrency: 'NGN',
            expectedReference: 'app_ref_123'
        });

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.paymentStatus).toBe('paid');
    });

    it('rejects a payment when the amount or currency does not match the expected values', () => {
        const service = new PaymentVerificationService();

        const result = service.verifyTransaction({
            status: 'success',
            amount: 5000,
            currency: 'USD',
            reference: 'app_ref_456',
            transactionId: 'paystack_txn_2',
            expectedAmount: 10000,
            expectedCurrency: 'NGN',
            expectedReference: 'app_ref_456'
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Amount mismatch.');
        expect(result.errors).toContain('Currency mismatch.');
    });
});
