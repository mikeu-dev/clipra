export interface DisbursementParams {
	bankCode: string;
	accountNumber: string;
	amount: number;
	description: string;
	externalId: string;
	idempotencyKey?: string;
}

export interface DisbursementResponse {
	id: string;
	status: 'pending' | 'success' | 'failed';
	externalId: string;
	rawResponse?: unknown;
}

export interface IPaymentGateway {
	createDisbursement(params: DisbursementParams): Promise<DisbursementResponse>;
	getDisbursementStatus(id: string): Promise<DisbursementResponse>;
	inquiryAccount(
		bankCode: string,
		accountNumber: string
	): Promise<{
		name: string;
		bankCode: string;
		accountNumber: string;
		rawResponse?: unknown;
	}>;
}
