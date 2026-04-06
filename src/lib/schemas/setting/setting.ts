import { z } from 'zod';

// Schema untuk 1 bahasa
export const singleLangSetting = z.object({
	app_name: z.string().min(1, 'Nama aplikasi wajib diisi'),
	address: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	copyright: z.string().optional(),
	website: z.string().optional(),
	about: z.string().optional(),
	logo_light: z.string().optional(),
	logo_dark: z.string().optional(),
	icon: z.string().optional()
});

// Schema multi-bahasa (dipakai kalau perlu semua sekaligus)
export const settingSchema = z.object({
	id: singleLangSetting,
	en: singleLangSetting
});

// Schema per bahasa
export const settingSchemaByLang = {
	id: singleLangSetting,
	en: singleLangSetting
} as const;

export type SingleLangSetting = z.infer<typeof singleLangSetting>;
export type SettingSchema = z.infer<typeof settingSchema>;
