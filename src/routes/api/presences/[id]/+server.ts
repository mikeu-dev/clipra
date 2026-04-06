import { PresenceModule } from '$lib/server/modules/presence/module';
import type { RequestEvent } from '@sveltejs/kit';

const controller = PresenceModule.getController();

export async function GET(event: RequestEvent) {
	return controller.getById(event);
}
