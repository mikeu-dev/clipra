import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { PresenceService } from './service';

export class PresenceController {
	// Service injection could be cleaner but follows current project pattern
	static async create(event: RequestEvent) {
		const service = new PresenceService(event.locals.activeCompany?.id);
		try {
			const data = await event.request.json();

			// Basic transformation for Date fields coming from JSON
			if (data.time && typeof data.time === 'string') {
				data.time = new Date(data.time);
			}

			const result = await service.create(data);
			return json(result, { status: 201 });
		} catch (error) {
			return json({ error: (error as Error).message }, { status: 400 });
		}
	}

	static async getAll(event: RequestEvent) {
		const service = new PresenceService(event.locals.activeCompany?.id);
		const page = Number(event.url.searchParams.get('page')) || 1;
		const limit = Number(event.url.searchParams.get('limit')) || 10;
		const month = Number(event.url.searchParams.get('month')) || undefined;
		const year = Number(event.url.searchParams.get('year')) || undefined;
		const search = event.url.searchParams.get('search') || undefined;

		try {
			const result = await service.getPaginated(page, limit, { month, year, search });
			return json(result);
		} catch (error) {
			return json({ error: (error as Error).message }, { status: 500 });
		}
	}

	static async getById(event: RequestEvent) {
		const service = new PresenceService(event.locals.activeCompany?.id);
		try {
			const { id } = event.params;
			if (!id) return json({ error: 'ID is required' }, { status: 400 });

			const result = await service.getById(id);
			if (!result) return json({ error: 'Not found' }, { status: 404 });

			return json(result);
		} catch (error) {
			return json({ error: (error as Error).message }, { status: 500 });
		}
	}
}
