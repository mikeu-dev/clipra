import { StorageService } from './service';

export class StorageModule {
	static getService(): StorageService {
		return new StorageService();
	}
}
