import { DevicesRepository } from './repository';

export class HikvisionService {
	private devicesRepo: DevicesRepository;

	constructor(companyId?: string) {
		this.devicesRepo = new DevicesRepository(companyId);
	}

	async getAllDevices() {
		if (!this.devicesRepo['companyId']) return [];
		return await this.devicesRepo.findAllByCompanyId(this.devicesRepo['companyId']);
	}

	async createDevice(data: Parameters<typeof this.devicesRepo.create>[0]) {
		return await this.devicesRepo.create(data);
	}

	async syncUserToDevice(deviceId: string, employeeId: string) {
		const { db } = await import('$lib/server/database');
		const { employees, users } = await import('$lib/server/database/schemas');
		const { eq } = await import('drizzle-orm');

		// 1. Get Device & Employee Data
		const device = await this.devicesRepo.findById(deviceId);
		if (!device) throw new Error('Device not found');

		const employeeData = await db
			.select({
				employee: employees,
				user: users
			})
			.from(employees)
			.innerJoin(users, eq(employees.userId, users.id))
			.where(eq(employees.id, employeeId))
			.limit(1);

		if (!employeeData[0]) throw new Error('Employee not found');
		const { employee, user } = employeeData[0];

		if (!employee.idCard) throw new Error('Employee ID Card Number is missing');

		// 2. Prepare Payload
		const payload = JSON.stringify({
			UserInfo: {
				employeeNo: employee.idCard,
				name: user.name,
				userType: 'normal',
				Valid: {
					enable: true,
					beginTime: '2024-01-01T00:00:00',
					endTime: '2035-01-01T00:00:00'
				}
			}
		});

		const url = `http://${device.ipAddress}:${device.port || 80}/ISAPI/AccessControl/UserInfo/Record?format=json`;

		// 3. Execute Request (Digest Auth Handshake)
		return await this.requestWithDigest(
			url,
			'PUT',
			payload,
			device.username || 'admin',
			device.password || '12345'
		);
	}

	// Generic Digest Request Handler
	private async requestWithDigest(
		url: string,
		method: string,
		body: string,
		user: string,
		pass: string
	) {
		const { DigestAuthClient } = await import('./digest-auth');

		// Step 1: Request to get 401 & challenge
		let res = await fetch(url, { method, body, headers: { 'Content-Type': 'application/json' } });

		if (res.status === 401) {
			const authHeader = res.headers.get('www-authenticate');
			if (!authHeader) throw new Error('No digest challenge provided');

			const params = DigestAuthClient.parseAuthHeader(authHeader);
			if (!params.nonce) throw new Error('Invalid digest challenge');

			const client = new DigestAuthClient(user, pass);
			const digestHeader = client.generateHeader(
				method,
				new URL(url).pathname + new URL(url).search,
				params.realm,
				params.nonce,
				params.qop,
				params.opaque
			);

			// Step 2: Retry with Authorization
			res = await fetch(url, {
				method,
				body,
				headers: {
					'Content-Type': 'application/json',
					Authorization: digestHeader
				}
			});
		}

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Device Refused: ${res.status} ${res.statusText} - ${text}`);
		}

		return await res.json();
	}
}
