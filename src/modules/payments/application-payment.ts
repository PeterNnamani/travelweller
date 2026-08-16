export interface PaymentVerificationInput {
    status: string;
    amount: number;
    currency: string;
    reference: string;
    transactionId: string;
    expectedAmount: number;
    expectedCurrency: string;
    expectedReference: string;
}

export interface PaymentVerificationResult {
    isValid: boolean;
    errors: string[];
    paymentStatus: 'pending' | 'paid' | 'failed';
    providerTransactionId?: string;
}

export class PaymentVerificationService {
    verifyTransaction(input: PaymentVerificationInput): PaymentVerificationResult {
        const errors: string[] = [];

        if (input.status !== 'success') {
            errors.push('Transaction is not successful.');
        }

        if (input.amount !== input.expectedAmount) {
            errors.push('Amount mismatch.');
        }

        if (input.currency !== input.expectedCurrency) {
            errors.push('Currency mismatch.');
        }

        if (input.reference !== input.expectedReference) {
            errors.push('Reference mismatch.');
        }

        if (!input.transactionId) {
            errors.push('Transaction ID missing.');
        }

        if (errors.length > 0) {
            return {
                isValid: false,
                errors,
                paymentStatus: 'failed',
                providerTransactionId: input.transactionId
            };
        }

        return {
            isValid: true,
            errors: [],
            paymentStatus: 'paid',
            providerTransactionId: input.transactionId
        };
    }
}
