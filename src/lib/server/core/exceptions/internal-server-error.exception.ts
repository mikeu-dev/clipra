import { HttpException } from './http-exception';

export class InternalServerErrorException extends HttpException {
	constructor(message = 'Internal Server Error', payload?: unknown) {
		super(message, 500, payload);
	}
}
