import { BaseController } from '$lib/server/core/base.controller';
import { NewsService } from './service';
import type * as table from '$lib/server/database/schemas';
import type { INewsService } from './interfaces/INewsService';

export class NewsController extends BaseController<table.News, table.NewNews> {
	protected override service: INewsService;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(service: INewsService = new NewsService(null as any)) {
		// The service will be properly injected by the Module
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		super(service as any);
		this.service = service;
	}

	async getBySlug(slug: string) {
		return this.service.getBySlug(slug);
	}

	async getAllPublished() {
		return this.service.getAllPublished();
	}
}
