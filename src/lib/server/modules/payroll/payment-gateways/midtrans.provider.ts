import type { IPaymentGateway, DisbursementParams, DisbursementResponse } from './interface';

export class MidtransPaymentGateway implements IPaymentGateway {
	private serverKey: string;
	private isProduction: boolean;

	constructor() {
		const env = process.env || {};
		this.serverKey = env.MIDTRANS_SERVER_KEY || '';
		this.isProduction = env.MIDTRANS_IS_PRODUCTION === 'true';
	}

	async createDisbursement(params: DisbursementParams): Promise<DisbursementResponse> {
		// Mock implementation for now
		return {
			id: `midtrans-${params.externalId}`,
			status: 'pending',
			externalId: params.externalId,
			rawResponse: { message: 'Mock Midtrans Request' }
		};
	}

	async getDisbursementStatus(id: string): Promise<DisbursementResponse> {
		return {
			id,
			status: 'pending',
			externalId: id,
			rawResponse: { message: 'Mock Status' }
		};
	}

	async inquiryAccount(
		bankCode: string,
		accountNumber: string
	): Promise<{
		name: string;
		bankCode: string;
		accountNumber: string;
		rawResponse?: unknown;
	}> {
		return {
			name: 'Mock Account',
			bankCode,
			accountNumber,
			rawResponse: { status: 'success' }
		};
	}
}
