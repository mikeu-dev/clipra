import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PayrollModule } from '$lib/server/modules/payroll/module';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload = await request.json();

		// 1. Signature Verification (Security)
		const signature = request.headers.get('x-callback-signature');
		if (!signature && process.env.NODE_ENV === 'production') {
			// In production, we should reject requests without signatures
			// For now, we log it and proceed as it depends on the provider config
			console.warn('[Webhook] Missing x-callback-signature header');
		}

		// Example verification logic (Skeleton)
		const isValid = verifySignature(signature, payload);
		if (!isValid && process.env.NODE_ENV === 'production') {
			// return json({ message: 'Invalid signature' }, { status: 401 });
		}

		const payrollService = PayrollModule.getService();

		// Mapping typical gateway payload to our service expectations
		// This is a generic mapping, in reality it depends on the gateway
		const externalId =
			(payload as { external_id?: string; order_id?: string; payroll_id?: string }).external_id ||
			(payload as { external_id?: string; order_id?: string; payroll_id?: string }).order_id ||
			(payload as { external_id?: string; order_id?: string; payroll_id?: string }).payroll_id;
		const status =
			(payload as { status?: string; transaction_status?: string }).status ||
			(payload as { status?: string; transaction_status?: string }).transaction_status;

		if (!externalId) {
			return json({ message: 'Missing externalId' }, { status: 400 });
		}

		console.log(`[Webhook] Received payment update for ${externalId}: ${status} `);

		await payrollService.handleGatewayWebhook({
			externalId,
			status:
				status === 'settlement' || status === 'success' || status === 'COMPLETED'
					? 'success'
					: 'failed',
			gatewayStatus: status || 'UNKNOWN'
		});

		return json({ message: 'OK' });
	} catch (error: unknown) {
		const err = error as { message?: string };
		console.error('[Webhook] Error processing payment webhook:', error);
		return json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
	}
};

/**
 * Skeleton for signature verification.
 * Implementation depends on the specific provider (Midtrans/Flip).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function verifySignature(signature: string | null, payload: any): boolean {
	if (!signature) return false;
	// Midtrans expects: SHA512(order_id + status_code + gross_amount + ServerKey)
	// Flip expects: HMAC-SHA256 of the payload using the Secret Key
	return true; // Placeholder for development
}
