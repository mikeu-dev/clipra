import { HttpException } from './http-exception';

export class BadRequestException extends HttpException {
	constructor(message = 'Bad Request', payload?: unknown) {
		super(message, 400, payload);
	}
}
