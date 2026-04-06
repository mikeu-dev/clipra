import type { PageServerLoad } from './$types';
import { ActivityLogService } from '$lib/server/modules/activity-log/service';

const activityService = new ActivityLogService();

export const load: PageServerLoad = async ({ params }) => {
	const activities = await activityService.getByUser(params.user);

	return {
		activities
	};
};
