// src/lib/server/database/seeds/seedRoles.ts
import { RoleService } from '../../modules/role/service';
import { generateId } from '$lib/utils/useUserId';
import { positions } from '../../../config/app';

const roleService = new RoleService();

function slugify(text: string) {
	return text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^\w-]+/g, '')
		.replace(/--+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '');
}

export async function seedRoles() {
	const rolesData = [
		{ name: 'superadmin', description: 'Super Admin', level: '1' },
		{ name: 'admin', description: 'Administrator', level: '10' },
		{ name: 'developer', description: 'Developer', level: '50' },
		{ name: 'finance', description: 'Finance', level: '50' },
		{ name: 'accounting', description: 'Accounting', level: '50' },
		{ name: 'hr-staff', description: 'HR Staff', level: '50' },
		{ name: 'sales', description: 'Sales / Penjualan', level: '50' },
		{ name: 'marketing', description: 'Marketing', level: '50' },
		{ name: 'purchasing', description: 'Purchasing / Pembelian', level: '50' },
		{ name: 'procurement', description: 'Procurement / Pengadaan', level: '50' },
		{ name: 'it-support', description: 'IT Support', level: '50' },
		{ name: 'general-affair', description: 'General Affair (GA)', level: '50' },
		{ name: 'legal', description: 'Legal / Hukum', level: '50' },
		{ name: 'contract', description: 'Pegawai Kontrak', level: '60' },
		{ name: 'admin-compro', description: 'Company Profile Admin', level: '20' },
		{ name: 'internship', description: 'Internship / Magang', level: '80' }
	];

	// Add positions as roles
	for (const pos of positions) {
		const roleName = slugify(pos.name);
		// Check if already exists in rolesData to avoid duplicates
		if (!rolesData.some((r) => r.name === roleName)) {
			let level = '50'; // Default Staff
			const nameLower = pos.name.toLowerCase();

			if (
				nameLower.includes('kepala') ||
				nameLower.includes('manager') ||
				nameLower.includes('chief') ||
				nameLower.includes('direktur') ||
				nameLower.includes('komisaris') ||
				nameLower.includes('ceo') ||
				nameLower.includes('cto') ||
				nameLower.includes('cio')
			) {
				level = '20';
			} else if (nameLower.includes('kontrak')) {
				level = '60';
			}

			rolesData.push({
				name: roleName,
				description: pos.name,
				level
			});
		}
	}

	console.log('[SEED] Standardizing role hierarchy...');
	for (const role of rolesData) {
		const existingRole = await roleService.getRoleByName(role.name);
		if (!existingRole) {
			const id = generateId();
			await roleService.createRole({
				id,
				...role
			});
			console.log(`[SEED] Created role: ${role.name} (Level ${role.level})`);
		} else {
			// Update level if it exists but is different
			if (existingRole.level !== role.level) {
				await roleService.updateRole(existingRole.id, { level: role.level });
				console.log(`[SEED] Updated level for ${role.name}: ${role.level}`);
			} else {
				console.log(`[SEED] Role ${role.name} already up to date.`);
			}
		}
	}
}
