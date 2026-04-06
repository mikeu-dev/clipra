import { db } from '../src/lib/server/database';
import { sql } from 'drizzle-orm';

async function main() {
	console.log('Creating devices table manually...');
	try {
		await db.execute(sql`
            CREATE TABLE IF NOT EXISTS \`devices\` (
                \`id\` varchar(36) NOT NULL,
                \`company_id\` varchar(36) NOT NULL,
                \`name\` varchar(100),
                \`ip_address\` varchar(50),
                \`port\` int DEFAULT 80,
                \`username\` varchar(50),
                \`password\` varchar(100),
                \`is_active\` boolean DEFAULT true,
                \`last_seen\` timestamp,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deleted_at\` timestamp,
                CONSTRAINT \`devices_id\` PRIMARY KEY(\`id\`),
                CONSTRAINT \`devices_company_id_companies_id_fk\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`))
        `);
		console.log('Devices table created successfully.');
		process.exit(0);
	} catch (e) {
		console.error('Failed to create devices table:', e);
		process.exit(1);
	}
}

main();
