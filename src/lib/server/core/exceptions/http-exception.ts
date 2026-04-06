import { BaseException } from './base.exception';

export class HttpException extends BaseException {
	public readonly payload?: unknown;

	constructor(message: string, statusCode: number, payload?: unknown) {
		super(message, statusCode);
		this.payload = payload;
	}
}
