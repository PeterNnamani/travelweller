import { NextResponse } from 'next/server';
import { finalizeSuccessfulPayment, getPaymentByReference, verifyPaystackTransactionServerSide } from '@/lib/application-access';

export async function POST(request: Request) {
    const payload = await request.json().catch(() => ({}));
    const event = payload?.event;
    const data = payload?.data ?? {};
    const reference = data?.reference;

    if (!reference || !event) {
        return NextResponse.json({ success: false, message: 'Invalid Paystack webhook payload.' }, { status: 400 });
    }

    const payment = getPaymentByReference(reference);
    if (!payment) {
        return NextResponse.json({ success: false, message: 'Payment reference not found.' }, { status: 404 });
    }

    const verification = verifyPaystackTransactionServerSide({
        status: data?.status ?? 'failed',
        amount: Number(data?.amount ?? 0) >= 1000 ? Number(data?.amount ?? 0) / 100 : Number(data?.amount ?? 0),
        currency: String(data?.currency ?? 'NGN'),
        reference,
        transactionId: data?.id ? String(data.id) : reference,
        expectedAmount: payment.amount,
        expectedCurrency: payment.paymentCurrency,
        expectedReference: payment.paymentReference,
    });

    if (!verification.isValid) {
        return NextResponse.json({ success: false, message: verification.errors.join(' ') }, { status: 400 });
    }

    const finalization = finalizeSuccessfulPayment(reference, String(data?.id ?? reference));

    return NextResponse.json({
        success: true,
        received: true,
        status: 'success',
        reference,
        accessStatus: finalization.access?.status ?? 'UNLOCKED',
        message: 'Webhook processed and access unlocked after server-side verification.'
    });
}
