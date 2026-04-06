import type { IPaymentGateway, DisbursementParams, DisbursementResponse } from './interface';

export class MockPaymentGateway implements IPaymentGateway {
	async createDisbursement(params: DisbursementParams): Promise<DisbursementResponse> {
		console.log(
			`[MockPaymentGateway] Creating disbursement of Rp ${params.amount} to ${params.bankCode} ${params.accountNumber}`
		);

		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return {
			id: `mock-disb-${Math.random().toString(36).substr(2, 9)}`,
			status: 'pending',
			externalId: params.externalId,
			rawResponse: { message: 'Mock disbursement created' }
		};
	}

	async getDisbursementStatus(id: string): Promise<DisbursementResponse> {
		return {
			id,
			status: 'success',
			externalId: 'mock-external-id'
		};
	}

	async inquiryAccount(
		bankCode: string,
		accountNumber: string
	): Promise<{ name: string; bankCode: string; accountNumber: string; rawResponse?: unknown }> {
		console.log(`[MockPaymentGateway] Inquiring account: ${bankCode} ${accountNumber}`);

		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		return {
			name: 'MOCK EMPLOYEE NAME',
			bankCode,
			accountNumber,
			rawResponse: { message: 'Mock inquiry successful' }
		};
	}
}
