import fs from 'fs';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../driver/driver';
import type { IStorageDriver } from '../interfaces/storage-driver.interface';

const streamPipeline = promisify(pipeline);

export class S3Driver implements IStorageDriver {
	async getPublicUrl(key: string): Promise<string> {
		const endpoint = process.env.AWS_ENDPOINT;
		return `${endpoint}/${key}`;
	}

	async upload({
		Bucket,
		Key,
		FilePath,
		ContentType = 'application/octet-stream'
	}: {
		Bucket?: string;
		Key: string;
		FilePath: string;
		ContentType?: string;
	}) {
		const fileStream = fs.createReadStream(FilePath);
		const command = new PutObjectCommand({
			Bucket: Bucket!,
			Key,
			Body: fileStream,
			ContentType,
			ACL: 'public-read'
		});
		await s3.send(command);
		console.log('[SUCCESS] Upload ke S3 berhasil');
	}

	async download({
		Bucket,
		Key,
		DownloadPath
	}: {
		Bucket?: string;
		Key: string;
		DownloadPath: string;
	}) {
		const command = new GetObjectCommand({ Bucket: Bucket!, Key });
		const response = await s3.send(command);
		await streamPipeline(
			response.Body as NodeJS.ReadableStream,
			fs.createWriteStream(DownloadPath)
		);
		console.log('[SUCCESS] Download dari S3 berhasil');
	}
}
