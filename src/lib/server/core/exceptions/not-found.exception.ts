import { HttpException } from './http-exception';

export class NotFoundException extends HttpException {
	constructor(message = 'Resource Not Found') {
		super(message, 404);
	}
}
