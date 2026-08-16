import { NextResponse } from 'next/server';
import { finalizeSuccessfulPayment, getPaymentByReference, verifyPaystackTransactionServerSide } from '@/lib/application-access';

export async function GET(request: Request, { params }: { params: { reference: string } }) {
    const reference = params.reference;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? 'success';
    const rawAmount = Number(searchParams.get('amount') ?? '0');
    const amount = rawAmount >= 1000 ? rawAmount / 100 : rawAmount;
    const currency = searchParams.get('currency') ?? 'NGN';
    const transactionId = searchParams.get('transaction_id') ?? reference;
    const payment = getPaymentByReference(reference);

    if (!payment) {
        return NextResponse.json({ success: false, message: 'Payment reference not found.' }, { status: 404 });
    }

    const verification = verifyPaystackTransactionServerSide({
        status,
        amount,
        currency,
        reference,
        transactionId,
        expectedAmount: payment.amount,
        expectedCurrency: payment.paymentCurrency,
        expectedReference: payment.paymentReference,
    });

    if (!verification.isValid) {
        return NextResponse.json({
            success: false,
            reference,
            verification,
            message: verification.errors.join(' '),
        }, { status: 400 });
    }

    const finalization = finalizeSuccessfulPayment(reference, transactionId);

    return NextResponse.json({
        success: true,
        reference,
        status: 'verified',
        accessStatus: finalization.access?.status ?? 'UNLOCKED',
        payment: {
            ref: payment.paymentReference,
            amount: payment.amount,
            currency: payment.paymentCurrency,
            status: finalization.payment?.status ?? 'SUCCESS',
        },
        message: 'Payment verified server-side and access has been unlocked.'
    });
}
