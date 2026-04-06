import fs from 'fs';
import path from 'path';
import type { IStorageDriver } from '../interfaces/storage-driver.interface';

export class LocalDriver implements IStorageDriver {
	async getPublicUrl(key: string): Promise<string> {
		return `/storage/${key}`;
	}

	async upload({ Key, FilePath }: { Key: string; FilePath: string }) {
		const destPath = path.join('./storage', Key);
		await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
		await fs.promises.copyFile(FilePath, destPath);
		console.log('[SUCCESS] Upload lokal berhasil:', destPath);
	}

	async download({ Key, DownloadPath }: { Key: string; DownloadPath: string }) {
		const srcPath = path.join('./storage', Key);
		await fs.promises.copyFile(srcPath, DownloadPath);
		console.log('[SUCCESS] Download lokal berhasil');
	}
}
