import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';
import { logger } from '$lib/server/modules/core/logger';

const transporter = nodemailer.createTransport({
	host: env.MAIL_HOST || 'smtp.gmail.com',
	port: Number(env.MAIL_PORT) || 587,
	secure: false,
	auth: {
		user: env.MAIL_USERNAME,
		pass: env.MAIL_PASSWORD
	}
});

export const MAIL_DEFAULTS = {
	from: 'Sv ERP <no-reply@sverp.com>',
	to: 'admin@sverp.com'
};

export const mailer = {
	sendMail: async (options: nodemailer.SendMailOptions) => {
		try {
			const info = await transporter.sendMail(options);
			logger.info('Email sent successfully', {
				messageId: info.messageId,
				to: options.to,
				subject: options.subject
			});
			return info;
		} catch (error) {
			logger.error('Error sending email', { error, to: options.to });
			throw error;
		}
	},

	// Fungsi baru untuk mengirim email via antrian (background)
	queueMail: async (options: nodemailer.SendMailOptions) => {
		try {
			// Import dinamis untuk menghindari circular dependency saat inisialisasi awal jika ada
			const { getEmailQueue } = await import('$lib/server/modules/queue/worker');

			await getEmailQueue().add('send-email', options);
			logger.info('Email queued', { to: options.to, subject: options.subject });
		} catch (error) {
			logger.error('Failed to queue email', { error });
			// Fallback: coba kirim langsung jika queue gagal?
			// Atau throw error tergantung kebutuhan bisnis
			throw error;
		}
	}
};
