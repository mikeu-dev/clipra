import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { userProfileSchema } from '$lib/schemas/profile/userProfile';
import { generateId } from '$lib/utils/useUserId';
import { ActivityLogService } from '$lib/server/modules/activity-log/service';
import { UserProfileService } from '$lib/server/modules/user-profile/service';
const activityLogService = new ActivityLogService();
const userProfileService = new UserProfileService();

export const load: PageServerLoad = async ({ params }) => {
	const userProfile = await userProfileService.getProfileByUserId(params.user);
	return {
		userProfile,
		form: await superValidate(zod(userProfileSchema))
	};
};

export const actions = {
	default: async (event) => {
		console.log('[ACTION] Menerima request form');

		const form = await superValidate(event, zod(userProfileSchema));
		console.log('[ACTION] Validasi form:', form);

		const userId = event.locals.user?.id;

		if (!form.valid) {
			console.warn('[ACTION] Form tidak valid:', form.errors);
			return fail(400, {
				form,
				error: { message: 'Mohon periksa kembali input Anda.' }
			});
		}

		const { address, birthDate, gender, phone, bio } = form.data;

		if (!userId) {
			console.warn('[ACTION] userId tidak ditemukan di session/local');
			return fail(403, {
				form,
				error: { message: 'Tidak memiliki izin untuk melakukan aksi ini.' }
			});
		}

		try {
			// Cek apakah profil sudah ada
			const existingProfile = await userProfileService.getProfileByUserId(userId);

			let actionType;

			if (existingProfile) {
				// update
				await userProfileService.updateProfile(userId, {
					address,
					birthDate: birthDate ? new Date(birthDate) : null,
					gender,
					phone,
					bio
				});
				actionType = 'update';
			} else {
				// create
				await userProfileService.createProfile({
					id: generateId(),
					userId: userId,
					address,
					birthDate: birthDate ? new Date(birthDate) : null,
					gender,
					phone,
					bio
				});
				actionType = 'create';
			}

			await activityLogService.create({
				userId,
				action: `${actionType} user profile`,
				entityType: 'userProfile',
				entityId: userId,
				meta: JSON.stringify({ userId })
			});

			console.log(`[ACTION] User profile berhasil di${actionType}:`, userId);

			return {
				form,
				success: true
			};
		} catch (e) {
			console.error('[ACTION] Terjadi error saat menyimpan:', e);

			if (typeof e === 'object' && e !== null && 'code' in e) {
				const err = e as { code: string };
				if (err.code === 'SQLITE_CONSTRAINT' || err.code === '23505') {
					return fail(400, {
						form,
						error: { message: 'Data sudah ada atau ada pelanggaran constraint.' }
					});
				}
			}

			return fail(500, {
				form,
				error: { message: 'Terjadi kesalahan saat memproses data.' }
			});
		}
	}
} satisfies Actions;
