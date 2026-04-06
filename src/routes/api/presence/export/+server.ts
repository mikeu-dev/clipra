import { PresenceModule } from '$lib/server/modules/presence/module';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/middleware';

const presenceService = PresenceModule.getService();

export const GET: RequestHandler = async (event) => {
	requireAuth(event);

	const { url } = event;
	const month = url.searchParams.get('month') ? Number(url.searchParams.get('month')) : undefined;
	const year = url.searchParams.get('year') ? Number(url.searchParams.get('year')) : undefined;

	try {
		const csv = await presenceService.exportCsv({ month, year });

		return new Response(csv, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': `attachment; filename="presences_${month || 'all'}_${year || 'all'}.csv"`
			}
		});
	} catch (e) {
		console.error(e);
		return json({ error: 'Export failed' }, { status: 500 });
	}
};
