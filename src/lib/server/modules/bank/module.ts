import { BankController } from './controller';
import { BankRepository } from './repository';
import { BankService } from './service';

export class BankModule {
	static getService(): BankService {
		const repository = new BankRepository();
		return new BankService(repository);
	}

	static create(): BankController {
		const service = this.getService();
		return new BankController(service);
	}
}
