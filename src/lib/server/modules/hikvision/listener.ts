import { PresenceService } from '../presence/service';
import { DevicesRepository } from './repository';

export class HikvisionListener {
	private devicesRepo: DevicesRepository;

	constructor() {
		this.devicesRepo = new DevicesRepository();
	}

	async processEvent(request: Request, clientIp: string) {
		// 1. Validate IP (Strict)
		if (clientIp.startsWith('::ffff:')) {
			clientIp = clientIp.substring(7);
		}

		// Check if IP allowed in devices table
		const device = await this.devicesRepo.findActiveByIp(clientIp);

		if (!device) {
			console.warn(`[Hikvision] Blocked event from unauthorized IP: ${clientIp}`);
			// Throw specific error to be caught by API endpoint
			throw new Error('UNAUTHORIZED_DEVICE');
		}

		// Update Last Seen (Fire and forget)
		this.devicesRepo.update(device.id, { lastSeen: new Date() }).catch((err) => {
			console.error('[Hikvision] Failed to update lastSeen:', err);
		});

		// 2. Parse Multipart/XML
		try {
			const formData = await request.formData();
			const eventLogXml = formData.get('event_log');

			if (!eventLogXml || typeof eventLogXml !== 'string') {
				return { status: 'ignored', reason: 'invalid_payload' };
			}

			// Parse XML using Regex
			const employeeNo = this.extractXmlValue(eventLogXml, 'employeeNoString');
			const dateTimeStr = this.extractXmlValue(eventLogXml, 'dateTime');

			if (!employeeNo || !dateTimeStr) {
				console.log('[Hikvision] Event ignored: No employee or time');
				return { status: 'ignored', reason: 'missing_data' };
			}

			const time = new Date(dateTimeStr);
			if (isNaN(time.getTime())) {
				return { status: 'ignored', reason: 'invalid_date' };
			}

			// 4. Call PresenceService
			// Use device companyId if available to scope the clockIn
			const presenceService = new PresenceService(device.companyId);

			const result = await presenceService.clockIn(employeeNo, time);

			console.log(
				`[Hikvision] Processed event for ${employeeNo} at ${time.toISOString()} (Device: ${device.name})`
			);

			return { status: 'success', data: result };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error(`[Hikvision] Logic Error (returning success to prevent retry):`, error);
			// Return handled failure
			return { status: 'failed_handled', error: errorMessage };
		}
	}

	private extractXmlValue(xml: string, tagName: string): string | null {
		const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 'i');
		const match = xml.match(regex);
		return match ? match[1] : null;
	}
}
