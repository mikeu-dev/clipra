import type { IPaymentGateway, DisbursementParams, DisbursementResponse } from './interface';

export class FlipPaymentGateway implements IPaymentGateway {
	private secretKey: string;

	constructor() {
		const env = process.env || {};
		this.secretKey = env.FLIP_SECRET_KEY || '';
	}

	async createDisbursement(params: DisbursementParams): Promise<DisbursementResponse> {
		return {
			id: `flip-${params.externalId}`,
			status: 'pending',
			externalId: params.externalId,
			rawResponse: { message: 'Mock Flip Request' }
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
