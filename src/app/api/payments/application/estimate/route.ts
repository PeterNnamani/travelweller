import { NextResponse } from 'next/server';
import { APPLICATION_SERVICE_FEE_GBP, calculateApplicationFeeNgn, getCurrentGbpToNgnRate } from '@/lib/application-access';

export async function GET() {
    const rate = getCurrentGbpToNgnRate();
    const amount = calculateApplicationFeeNgn(APPLICATION_SERVICE_FEE_GBP);

    return NextResponse.json({
        success: true,
        payment: {
            baseAmount: APPLICATION_SERVICE_FEE_GBP,
            baseCurrency: 'GBP',
            exchangeRate: rate,
            paymentAmount: amount,
            paymentCurrency: 'NGN',
            rateTimestamp: new Date().toISOString(),
        },
    });
}
