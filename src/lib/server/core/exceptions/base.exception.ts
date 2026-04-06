export abstract class BaseException extends Error {
	statusCode: number;
	name: string;

	constructor(message: string, statusCode = 500) {
		super(message);
		this.statusCode = statusCode;
		this.name = this.constructor.name;

		// Memastikan stack trace tercatat dengan benar
		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
