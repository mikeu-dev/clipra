import { json } from '@sveltejs/kit';
import { mailer, MAIL_DEFAULTS } from '$lib/server/modules/email/transport';

export async function POST({ request }) {
	const { name, email, subject, message, to } = await request.json();

	try {
		await mailer.sendMail({
			from: MAIL_DEFAULTS.from,
			to: to || MAIL_DEFAULTS.to,
			replyTo: email, // agar admin bisa langsung balas ke pengirim
			subject: subject || `Pesan dari ${name}`,
			text: message,
			html: `<p><strong>Pengirim:</strong> ${name} (${email})</p><p>${message}</p>`
		});

		return json({ success: true });
	} catch (error) {
		console.error(error);
		return json({ success: false, error: 'Gagal mengirim email' }, { status: 500 });
	}
}
