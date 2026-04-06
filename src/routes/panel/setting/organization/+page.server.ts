import type { Actions, PageServerLoad } from './$types';
import { EmployeeService } from '$lib/server/modules/employee/service';
import { PositionService } from '$lib/server/modules/position/service';
import { fail } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

import { StorageService } from '$lib/server/modules/storage/service';
import { UserProfileService } from '$lib/server/modules/user-profile/service';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { randomUUID } from 'crypto';

const employeeService = new EmployeeService();
const positionService = new PositionService();
const storage = new StorageService();
const userProfileService = new UserProfileService();

export const load: PageServerLoad = async () => {
	const employees = await employeeService.getAllWithDetails();
	const positions = await positionService.getAll();

	return {
		employees,
		positions
	};
};

export const actions: Actions = {
	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const userId = formData.get('userId') as string;
		const reportsTo = (formData.get('reportsTo') as string) || null;
		const division = (formData.get('division') as string) || null;
		const positionId = (formData.get('positionId') as string) || null;
		const isPublic = formData.get('isPublic') === 'true';
		const avatarFileName = formData.get('avatar') as string | null;

		if (!id) {
			return fail(400, { message: m.error_invalid_employee_id() });
		}

		try {
			await employeeService.updateOrganizationInfo(id, {
				reportsTo,
				division,
				positionId,
				isPublic
			});

			if (avatarFileName && userId) {
				const tmpPath = path.join(process.cwd(), 'static/tmp', avatarFileName);
				if (fs.existsSync(tmpPath)) {
					const ext = path.extname(avatarFileName) || '.img';
					const permanentFilename = `avatar-${randomUUID()}${ext}`;
					const permanentPath = `avatars/${permanentFilename}`;

					await storage.upload({
						Key: permanentPath,
						FilePath: tmpPath,
						ContentType: 'auto'
					});

					await fsPromises.unlink(tmpPath).catch(() => {});

					const publicUrl = await storage.getPublicUrl(permanentPath);

					const existingProfile = await userProfileService.getProfileByUserId(userId);
					if (existingProfile) {
						await userProfileService.updateProfile(existingProfile.id, { avatar: publicUrl });
					} else {
						await userProfileService.createProfile({
							id: randomUUID(),
							userId,
							avatar: publicUrl
						});
					}
				}
			}

			return { success: true, message: m.success_organization_updated() };
		} catch (e) {
			const error = e as Error;
			return fail(500, { message: error.message || m.error_system_failure() });
		}
	}
};
