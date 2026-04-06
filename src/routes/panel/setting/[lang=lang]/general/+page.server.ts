// src/routes/panel/setting/[lang=lang]/general/+page.server.ts
import { ActivityLogModule } from '$lib/server/modules/activity-log/module';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { settingSchemaByLang } from '$lib/schemas/setting/setting';
import * as m from '$lib/paraglide/messages.js';

import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { randomUUID } from 'crypto';
import { useAppConfig } from '$lib/utils/useAppConfig';
import { SettingController } from '$lib/server/modules/setting/controller';
import { StorageService } from '$lib/server/modules/storage/service';

const controller = new SettingController();
const storage = new StorageService();
const logService = ActivityLogModule.getService();
type LocaleKey = 'id' | 'en';

export const load: PageServerLoad = async ({ params }) => {
	const lang = (params.lang === 'en' ? 'en' : 'id') as LocaleKey;
	const settingsRaw = await controller.getMapByGroup('general');
	const settings = Object.fromEntries(
		Object.entries(settingsRaw).map(([key, value]) => [key, JSON.parse(value)])
	);
	const localizedSettings = useAppConfig().toPerLocale(settings);
	const logoLight = localizedSettings[lang].logo_light;
	const logoDark = localizedSettings[lang].logo_dark;
	const icon = localizedSettings[lang].icon;
	return {
		lang,
		urls: {
			logoLight: logoLight ? await storage.getPublicUrl(logoLight) : null,
			logoDark: logoDark ? await storage.getPublicUrl(logoDark) : null,
			icon: icon ? await storage.getPublicUrl(icon) : null
		},
		form: await superValidate(localizedSettings[lang], zod(settingSchemaByLang[lang]))
	};
};

export const actions = {
	default: async (event) => {
		console.log('[ACTION] Memulai proses update setting');

		const lang = (event.params.lang === 'en' ? 'en' : 'id') as LocaleKey;
		console.log('[ACTION] Bahasa:', lang);

		const form = await superValidate(event, zod(settingSchemaByLang[lang]));
		console.log('[ACTION] Form valid:', form.valid);

		if (!form.valid) {
			console.log('[ACTION] Form tidak valid:', form.errors);
			return fail(400, {
				form,
				error: { message: m.error_check_input() }
			});
		}

		const handleMove = async (field: string, dir = 'settings') => {
			const tmpFilename = (form.data as Record<string, unknown>)[field] as string;
			if (!tmpFilename) {
				console.log(`[UPLOAD] Tidak ada file untuk field ${field}`);
				return;
			}

			const tmpPath = path.join(process.cwd(), 'static/tmp', tmpFilename);
			if (!fs.existsSync(tmpPath)) {
				console.log(`[UPLOAD] File tidak ditemukan di path: ${tmpPath}`);
				return;
			}

			const ext = path.extname(tmpFilename);
			const filename = `${field}-${randomUUID()}${ext}`;
			const permanentPath = `${dir}/${filename}`;

			console.log(`[UPLOAD] Mengupload file ${tmpFilename} ke ${permanentPath}`);

			try {
				await storage.upload({
					Key: permanentPath,
					FilePath: tmpPath,
					ContentType: 'auto'
				});
				console.log(`[UPLOAD] Berhasil upload ${field}`);
			} catch (e) {
				console.error(`[UPLOAD] Gagal upload ${field}:`, e);
				throw new Error(m.error_upload_file({ field }));
			} finally {
				try {
					await fsPromises.unlink(tmpPath);
					console.log(`[UPLOAD] Menghapus file sementara ${tmpPath}`);
				} catch (error) {
					console.warn(`[UPLOAD] Gagal menghapus file sementara ${tmpPath}:`, error);
				}
			}

			(form.data as Record<string, unknown>)[field] = await storage.getPublicUrl(permanentPath);
			console.log(
				`[UPLOAD] Public URL untuk ${field}:`,
				(form.data as Record<string, unknown>)[field]
			);
		};

		try {
			await handleMove('logo_light');
			await handleMove('logo_dark');
			await handleMove('icon');

			for (const [key, value] of Object.entries(form.data)) {
				console.log(`[DB] Memproses key: ${key}, value: ${value}`);

				const existing = await controller.getByKey('general', key);
				console.log(`[DB] Existing setting:`, existing);

				let newValue: { id: string; en: string };
				if (existing) {
					const parsed = JSON.parse(existing.value);
					newValue = {
						id: lang === 'id' ? (value as string) : parsed.id,
						en: lang === 'en' ? (value as string) : parsed.en
					};
				} else {
					newValue = {
						id: lang === 'id' ? (value as string) : '',
						en: lang === 'en' ? (value as string) : ''
					};
				}

				console.log(`[DB] Upserting setting:`, newValue);
				await controller.upsert({
					group: 'general',
					key,
					value: JSON.stringify(newValue)
				});
			}

			console.log('[LOG] Membuat activity log');
			const userLocals = event.locals.user;
			let userId = '';
			if (
				userLocals &&
				typeof userLocals === 'object' &&
				'id' in userLocals &&
				typeof (userLocals as { id?: unknown }).id === 'string'
			) {
				userId = (userLocals as { id: string }).id;
			}
			await logService.create({
				userId,
				action: 'update setting general',
				entityType: 'setting',
				entityId: 'general',
				meta: JSON.stringify({ keys: Object.keys(form.data), lang })
			});

			console.log('[ACTION] Selesai update setting');
			return message(form, m.success_settings_updated());
		} catch (e) {
			console.error('[ACTION] Gagal menyimpan setting:', e);
			return fail(500, {
				form,
				error: { message: m.msg_error_save_settings() }
			});
		}
	}
} satisfies Actions;
