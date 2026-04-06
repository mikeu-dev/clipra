import { LocalDriver } from '$lib/server/storage/driver/local.driver';
import { S3Driver } from '$lib/server/storage/driver/s3.driver';
import type { IStorageDriver } from '$lib/server/storage/interfaces/storage-driver.interface';
import { env } from '$env/dynamic/private';

type StorageDriver = 's3' | 'local';

export class StorageService {
	private driver: IStorageDriver;

	constructor() {
		const envDriver = env.STORAGE_DRIVER;

		const driver: StorageDriver = envDriver === 's3' || envDriver === 'local' ? envDriver : 'local';

		if (driver === 's3') {
			this.driver = new S3Driver();
		} else {
			this.driver = new LocalDriver(); // default: local
		}
	}

	async getPublicUrl(key: string) {
		return this.driver.getPublicUrl(key);
	}

	async upload(params: { Bucket?: string; Key: string; FilePath: string; ContentType?: string }) {
		return this.driver.upload(params);
	}

	async download(params: { Bucket?: string; Key: string; DownloadPath: string }) {
		return this.driver.download(params);
	}
}
