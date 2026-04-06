export interface IStorageDriver {
	getPublicUrl(key: string): Promise<string>;
	upload(params: {
		Bucket?: string;
		Key: string;
		FilePath: string;
		ContentType?: string;
	}): Promise<void>;
	download(params: { Bucket?: string; Key: string; DownloadPath: string }): Promise<void>;
}
