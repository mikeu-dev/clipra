import { z } from 'zod';

export const announcementFormSchema = z.object({
	title: z.string().min(3, 'Judul minimal 3 karakter'),
	content: z.string().refine((val) => {
		// Ganti closing tags block (p, div, br) dengan spasi terlebih dulu agar jarak antar baris tidak menempel jadi satu kata
		let text = val.replace(/<\/(p|div|li|h[1-6])>|<br\s*\/?>/gi, ' ');
		// Hapus semua sisa tag HTML
		text = text.replace(/<[^>]*>?/gm, '');
		// Ganti HTML entities whitespace &nbsp; dkk dan multiple spaces/newlines jadi single space
		text = text.replace(/&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, ' ');
		text = text
			.replace(/[\r\n\t]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		return text.length >= 10;
	}, 'Konten minimal 10 karakter'),
	priority: z.enum(['normal', 'urgent']).default('normal'),
	targetType: z.enum(['all', 'role', 'user']),
	targetValue: z.string().optional(), // JSON string of role IDs or user IDs
	status: z.enum(['draft', 'published']).default('draft'),
	expiresAt: z
		.string()
		.optional()
		.refine((val) => {
			if (!val) return true;
			const date = new Date(val);
			return !isNaN(date.getTime());
		}, 'Format tanggal kedaluwarsa tidak valid')
});

export type AnnouncementFormSchema = typeof announcementFormSchema;
