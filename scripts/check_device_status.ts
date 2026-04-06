import { db } from '../src/lib/server/database';
import { devices } from '../src/lib/server/database/schemas';
import { isNotNull } from 'drizzle-orm';

async function main() {
	console.log('Checking device status...');
	const result = await db.select().from(devices).where(isNotNull(devices.lastSeen));

	if (result.length > 0) {
		console.log('Found devices with updated last_seen:');
		result.forEach((d) => {
			console.log(`- ${d.name} (${d.ipAddress}): ${d.lastSeen}`);
		});
	} else {
		console.log('No devices have last_seen updated.');
	}
}

main();
