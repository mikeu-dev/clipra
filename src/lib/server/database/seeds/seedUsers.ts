import { hash } from '@node-rs/argon2';
import { UserService } from '../../../server/modules/user/service';
import { RoleService } from '../../../server/modules/role/service';

const roleService = new RoleService();
const userService = new UserService();

export async function seedUsers() {
	const roles = await roleService.getAllRoles();

	if (!process.env.PASSWORD_DEFAULT) {
		throw new Error('PASSWORD_DEFAULT environment variable is not set.');
	}

	console.log('[SEED] Seeding representative users for each level...');
	const passwordHash = await hash(process.env.PASSWORD_DEFAULT, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	// Automatically generate a sample user for EVERY role in the database
	for (const role of roles) {
		const username = role.name.toLowerCase().replace(/\s+/g, '-');
		const email = `${username}@example.com`;
		const existingUser = await userService.getByEmail(email);

		if (!existingUser) {
			await userService.create({
				roleId: role.id,
				name: role.description || role.name,
				username: username,
				email: email,
				passwordHash: passwordHash,
				emailVerified: true
			});
			console.log(`[SEED] Created user: ${username} (Role: ${role.name}, Level: ${role.level})`);
		} else {
			// Ensure role is up to date for existing sample users
			if (existingUser.roleId !== role.id) {
				await userService.update(existingUser.id, { roleId: role.id });
				console.log(`[SEED] Updated role for ${username} to ${role.name}`);
			} else {
				console.log(`[SEED] User ${email} already exists and is correct. Skipping.`);
			}
		}
	}
}
