import { NextResponse } from 'next/server';
import { APPLICATION_SERVICE_FEE_GBP, calculateApplicationFeeNgn, createPaymentRecord, getCurrentGbpToNgnRate, resolveAuthenticatedUserId } from '@/lib/application-access';

export async function POST(request: Request) {
    const payload = await request.json().catch(() => ({}));
    const userId = resolveAuthenticatedUserId(request, payload?.userId ?? 'guest-user');
    const baseAmount = APPLICATION_SERVICE_FEE_GBP;
    const exchangeRate = getCurrentGbpToNgnRate();
    const amount = calculateApplicationFeeNgn(baseAmount);
    const reference = `app_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    const payment = createPaymentRecord({
        userId,
        paymentReference: reference,
        amount,
        baseAmount,
        baseCurrency: 'GBP',
        paymentCurrency: 'NGN',
        exchangeRate,
    });

    let authorizationUrl = `https://paystack.com/pay/${reference}`;

    if (paystackSecretKey) {
        try {
            const response = await fetch('https://api.paystack.co/transaction/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${paystackSecretKey}`,
                },
                body: JSON.stringify({
                    email: payload?.email ?? 'applicant@example.com',
                    amount: amount * 100,
                    currency: 'NGN',
                    reference,
                    callback_url: `${process.env.APP_URL ?? 'http://localhost:3000'}/applications/1`,
                    metadata: {
                        userId,
                        feeType: 'application_service_fee',
                        paymentReference: reference,
                    },
                }),
            });

            const paystackData = await response.json();
            if (response.ok && paystackData?.data?.authorization_url) {
                authorizationUrl = paystackData.data.authorization_url;
            }
        } catch {
            authorizationUrl = `https://paystack.com/pay/${reference}`;
        }
    }

    return NextResponse.json({
        success: true,
        reference,
        authorizationUrl,
        amount: payment.amount,
        currency: payment.paymentCurrency,
        feeType: 'application_service_fee',
        payment: {
            baseAmount: payment.baseAmount,
            baseCurrency: payment.baseCurrency,
            exchangeRate: payment.exchangeRate,
            paymentAmount: payment.amount,
            paymentCurrency: payment.paymentCurrency,
            rateTimestamp: payment.createdAt,
        },
    });
}
