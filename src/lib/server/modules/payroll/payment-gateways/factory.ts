import type { IPaymentGateway } from './interface';
import { MockPaymentGateway } from './mock.provider';
import { MidtransPaymentGateway } from './midtrans.provider';
import { FlipPaymentGateway } from './flip.provider';

export class PaymentGatewayFactory {
	static getProvider(): IPaymentGateway {
		// Use process.env for compatibility with Test Scripts (Bun) and Node Adapter
		// In SvelteKit, ensure .env is loaded into process.env or use $env in production
		const env = process.env || {};
		const provider = env.PAYMENT_PROVIDER || 'mock';

		switch (provider.toLowerCase()) {
			case 'midtrans':
				return new MidtransPaymentGateway();
			case 'flip':
				return new FlipPaymentGateway();
			case 'mock':
			default:
				return new MockPaymentGateway();
		}
	}
}
