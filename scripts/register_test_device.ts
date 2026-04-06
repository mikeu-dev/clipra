import { db } from '../src/lib/server/database';
import { devices, companies } from '../src/lib/server/database/schemas';

async function main() {
	console.log('Registering localhost device...');

	// Get company
	const company = await db.select().from(companies).limit(1);
	if (!company[0]) {
		console.error('No company found to attach device');
		process.exit(1);
	}

	// Insert 127.0.0.1
	const deviceId = crypto.randomUUID();
	await db.insert(devices).values({
		id: deviceId,
		companyId: company[0].id,
		name: 'Local Test Device',
		ipAddress: '127.0.0.1', // Standard localhost
		port: 80,
		isActive: true,
		username: 'admin',
		password: 'password'
	});
	console.log('Registered 127.0.0.1');

	// Insert ::1 (IPv6 localhost) just in case
	const deviceId2 = crypto.randomUUID();
	await db.insert(devices).values({
		id: deviceId2,
		companyId: company[0].id,
		name: 'Local Generic Device',
		ipAddress: '::1',
		port: 80,
		isActive: true,
		username: 'admin',
		password: 'password'
	});
	console.log('Registered ::1');
}

main();
