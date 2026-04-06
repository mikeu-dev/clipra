// src/routes/api/auth/reset-password/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { PasswordResetController } from '$lib/server/modules/passwordReset/controller';
const controller = new PasswordResetController();

export async function POST({ request }: RequestEvent) {
	const { token, newPassword } = await request.json();

	try {
		await controller.resetPassword(token, newPassword);
		return json({ success: true });
	} catch (err) {
		return json({ success: false, message: (err as Error).message }, { status: 400 });
	}
}
