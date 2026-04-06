import { LeaveRepository } from './repository';
import { LeaveService } from './service';

export class LeaveModule {
	static getService(): LeaveService {
		const repository = new LeaveRepository();
		return new LeaveService(repository);
	}
}
