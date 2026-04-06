import { Queue, Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from '$lib/server/modules/core/logger';
import { mailer } from '$lib/server/modules/email/transport';

// Lazy connection and queue
let _connection: IORedis | null = null;
let _emailQueue: Queue | null = null;
let _announcementQueue: Queue | null = null;

export const getConnection = () => {
	if (!_connection) {
		_connection = new IORedis({
			host: 'localhost',
			port: 6379,
			maxRetriesPerRequest: null
		});
	}
	return _connection;
};

export const getEmailQueue = () => {
	if (!_emailQueue) {
		_emailQueue = new Queue(EMAIL_QUEUE_NAME, { connection: getConnection() });
	}
	return _emailQueue;
};

export const getAnnouncementQueue = () => {
	if (!_announcementQueue) {
		_announcementQueue = new Queue(ANNOUNCEMENT_QUEUE_NAME, { connection: getConnection() });
	}
	return _announcementQueue;
};

// Nama Queue
export const EMAIL_QUEUE_NAME = 'email-queue';
export const ANNOUNCEMENT_QUEUE_NAME = 'announcement-queue';

// Definisi Worker (Pemroses Job)
// Worker sebaiknya diinisialisasi sekali saja saat server startup
export const initQueueWorker = () => {
	logger.info('Initializing Queue Worker...');

	// Email Worker
	const emailWorker = new Worker(
		EMAIL_QUEUE_NAME,
		async (job: Job) => {
			logger.info(`Processing email job ${job.id}: ${job.name}`);

			if (job.name === 'send-email') {
				const { to, subject, html, text } = job.data;
				await mailer.sendMail({ to, subject, html, text });
			}
		},
		{ connection: getConnection() }
	);

	// Announcement Worker
	const announcementWorker = new Worker(
		ANNOUNCEMENT_QUEUE_NAME,
		async (job: Job) => {
			logger.info(`Processing announcement job ${job.id}: ${job.name}`);

			if (job.name === 'auto-archive') {
				const { AnnouncementModule } = await import('$lib/server/modules/announcement/module');
				await AnnouncementModule.getService().runAutoArchive();
			}

			if (job.name === 'announcement-broadcast') {
				const { announcementId } = job.data;
				const { AnnouncementModule } = await import('$lib/server/modules/announcement/module');
				await AnnouncementModule.getService().processBroadcast(announcementId);
			}
		},
		{ connection: getConnection() }
	);

	// Setup Scheduled Jobs
	const announcementQueue = getAnnouncementQueue();
	announcementQueue.add(
		'auto-archive',
		{},
		{
			repeat: {
				pattern: '0 0 * * *' // Every day at midnight
			}
		}
	);

	[emailWorker, announcementWorker].forEach((worker) => {
		worker.on('completed', (job) => {
			logger.info(`Job ${job.id} on ${worker.name} has completed!`);
		});

		worker.on('failed', (job, err) => {
			logger.error(`Job ${job?.id} on ${worker.name} has failed with ${err.message}`, {
				error: err
			});
		});
	});

	return { emailWorker, announcementWorker };
};
