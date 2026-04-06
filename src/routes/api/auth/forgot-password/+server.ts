// src/routes/api/auth/forgot-password/+server.ts
import { json, type RequestEvent } from '@sveltejs/kit';
import { PasswordResetController } from '$lib/server/modules/passwordReset/controller';

const controller = new PasswordResetController();

export async function POST({ request }: RequestEvent) {
	const { email } = await request.json();

	await controller.forgotPassword(email);

	return json({ success: true });
}
