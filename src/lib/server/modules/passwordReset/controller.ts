// src/lib/server/controllers/PasswordResetController.ts
import { PasswordResetService } from './service';
import { EmailService } from '../email/service';
import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import { eq } from 'drizzle-orm';

export class PasswordResetController {
	private service: PasswordResetService;
	private mail: EmailService;

	constructor() {
		this.service = new PasswordResetService();
		this.mail = new EmailService();
	}

	async forgotPassword(email: string) {
		const [user] = await db.select().from(table.users).where(eq(table.users.email, email));
		if (!user) return; // jangan bocorkan bahwa email tidak ada

		const { token, expiresAt } = await this.service.requestReset(user.id);

		// kirim email reset password
		await this.mail.sendPasswordReset(user.email, token);

		return { expiresAt };
	}

	async resetPassword(token: string, newPassword: string) {
		await this.service.resetPassword(token, newPassword);
	}
}
