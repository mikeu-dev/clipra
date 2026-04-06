import { PermissionService } from '../../modules/permission/service';
import { RoleService } from '../../modules/role/service';

const permissionService = new PermissionService();
const roleService = new RoleService();

// Define all resources in the system
const resources = [
	'users',
	'roles',
	'permissions',
	'user_profiles',
	'projects',
	'tasks',
	'clients',
	'invoices',
	'expenses',
	'timesheets',
	'leave_requests',
	'reports',
	'settings',
	'banks',
	'positions',
	'religions',
	'schools',
	'shifts',
	'stages',
	'units',
	'services',
	'jobs',
	'job_applicants',
	'news',
	'pages',
	'activity_logs',
	'announcements',
	'presences',
	'payroll',
	'accounting',
	'leads',
	'orders',
	'products',
	'stock_moves',
	'warehouses',
	'locations',
	'purchase_requisitions',
	'purchase_orders',
	'tags',
	'categories',
	'superadmin'
];

const actions = ['create', 'read', 'update', 'delete'];

// Define permission sets for efficient assignment
const permSets = {
	all: [] as string[], // Helper to get all permissions
	readAll: [] as string[],

	// Module specific sets
	finance: [
		'invoices',
		'expenses',
		'banks',
		'clients',
		'projects',
		'reports',
		'payroll',
		'accounting',
		'purchase_requisitions',
		'purchase_orders'
	],
	hr: [
		'users',
		'roles',
		'positions',
		'shifts',
		'leave_requests',
		'jobs',
		'job_applicants',
		'timesheets',
		'presences',
		'payroll'
	],
	engineering: [
		'projects',
		'tasks',
		'timesheets',
		'documents',
		'clients',
		'products',
		'stock_moves',
		'purchase_requisitions'
	],
	marketing: [
		'clients',
		'news',
		'services',
		'pages',
		'newsletter_subscriptions',
		'leads',
		'orders'
	],
	masters: ['banks', 'religions', 'schools', 'units', 'stages', 'services', 'tags', 'categories'],
	inventory: ['products', 'stock_moves', 'warehouses', 'locations'],
	crm: ['leads', 'orders'],
	accounting: ['accounting'],
	procurement: ['purchase_requisitions', 'purchase_orders']
};

export async function seedPermissions() {
	console.log('Seeding permissions...');

	const createdPermissions: { id: string; name: string }[] = [];

	// 1. Create all base permissions
	for (const resource of resources) {
		for (const action of actions) {
			const name = `${resource}.${action}`;
			const permission = await permissionService.createPermission({
				name: name,
				resource: resource,
				action: action,
				description: `Allow ${action} on ${resource}`
			});
			if (permission && permission.id) {
				createdPermissions.push({ id: permission.id, name: name });
			}
		}
	}

	console.log(`Created ${createdPermissions.length} base permissions.`);

	// Create special permissions
	const specialPerms = [
		{
			name: 'announcements.publish',
			resource: 'announcements',
			action: 'publish',
			description: 'Allow publishing announcements'
		},
		{
			name: 'announcements.view',
			resource: 'announcements',
			action: 'view',
			description: 'Allow viewing announcements list'
		},
		{
			name: 'news.publish',
			resource: 'news',
			action: 'publish',
			description: 'Allow publishing news'
		}
	];
	for (const sp of specialPerms) {
		const permission = await permissionService.createPermission(sp);
		if (permission && permission.id) {
			createdPermissions.push({ id: permission.id, name: sp.name });
		}
	}

	console.log(`Total ${createdPermissions.length} permissions (including special).`);

	// 2. Assign permissions to roles
	const allRoles = await roleService.getAllRoles();
	const allPermIds = createdPermissions.map((p) => p.id);

	for (const role of allRoles) {
		let rolePerms: string[] = [];
		const roleName = role.name;

		// EXECUTIVE / SUPER ADMIN - Full Access
		if (
			[
				'superadmin',
				'chief-executive-officer',
				'dewan-komisaris',
				'chief-technology-officer',
				'chief-information-officer'
			].includes(roleName)
		) {
			console.log(`Assigning FULL ACCESS to ${roleName}`);
			await permissionService.syncRolePermissions(role.id, allPermIds);
			continue;
		}

		// FINANCE & ADMIN
		if (['finance-manager', 'accounting', 'finance', 'purchasing', 'admin'].includes(roleName)) {
			// All Finance permissions + Read Users + Read Roles + Masters
			const financePerms = filterPerms(createdPermissions, permSets.finance, [
				'create',
				'read',
				'update',
				'delete'
			]);
			const masterPerms = filterPerms(createdPermissions, permSets.masters, [
				'create',
				'read',
				'update',
				'delete'
			]);
			const basicRead = filterPerms(createdPermissions, ['users', 'roles'], ['read']);

			rolePerms = [...financePerms, ...masterPerms, ...basicRead];
		}

		// HR & MANAGEMENT
		else if (['human-resource-manager', 'staff-manager', 'assistant-manager'].includes(roleName)) {
			// All HR permissions + Read Projects + Masters
			const hrPerms = filterPerms(createdPermissions, permSets.hr, [
				'create',
				'read',
				'update',
				'delete'
			]);
			const masterPerms = filterPerms(createdPermissions, permSets.masters, [
				'create',
				'read',
				'update',
				'delete'
			]);
			const projectRead = filterPerms(
				createdPermissions,
				['projects', 'tasks', 'reports'],
				['read']
			);

			rolePerms = [...hrPerms, ...masterPerms, ...projectRead];
		}

		// ENGINEERING / TECHNICAL
		else if (
			[
				'software-engineer',
				'network-engineer',
				'web-developer',
				'mobile-developer',
				'quality-assurance',
				'uiux-designer',
				'developer',
				'quality'
			].includes(roleName)
		) {
			// Engineering permissions + Read Users + Read Clients
			const engPerms = filterPerms(createdPermissions, permSets.engineering, [
				'create',
				'read',
				'update',
				'delete'
			]);
			const userRead = filterPerms(createdPermissions, ['users', 'roles'], ['read']);
			const selfService = filterPerms(createdPermissions, ['leave_requests'], ['create', 'read']); // Can request leave

			rolePerms = [...engPerms, ...userRead, ...selfService];
		}

		// MARKETING & SALES
		else if (['marketing-executive', 'marketing', 'sales'].includes(roleName)) {
			// Marketing perms + Read Projects
			const mktPerms = filterPerms(createdPermissions, permSets.marketing, [
				'create',
				'read',
				'update',
				'delete'
			]);
			const projectRead = filterPerms(createdPermissions, ['projects'], ['read']);

			rolePerms = [...mktPerms, ...projectRead];
		}

		// IT SUPPORT & GA & LEGAL
		else if (['it-support', 'general-affair', 'legal'].includes(roleName)) {
			const masterRead = filterPerms(createdPermissions, permSets.masters, ['read']);
			const newsRead = filterPerms(createdPermissions, ['news'], ['read']);
			const selfService = filterPerms(createdPermissions, ['leave_requests'], ['create', 'read']);

			rolePerms = [...masterRead, ...newsRead, ...selfService];

			if (roleName === 'it-support') {
				rolePerms.push(...filterPerms(createdPermissions, ['activity_logs'], ['read']));
			}
		}

		// HR STAFF
		else if (['hr-staff'].includes(roleName)) {
			const hrRead = filterPerms(createdPermissions, permSets.hr, ['read']);
			const hrWrite = filterPerms(
				createdPermissions,
				['users', 'job_applicants'],
				['create', 'update']
			);
			const masterRead = filterPerms(createdPermissions, permSets.masters, ['read']);

			rolePerms = [...hrRead, ...hrWrite, ...masterRead];
		}

		// ADMIN COMPRO
		else if (roleName === 'admin-compro') {
			// Full access to Compro related entities (News, Pages, Services, Portfolios/Projects)
			const comproPerms = filterPerms(
				createdPermissions,
				['news', 'pages', 'services', 'projects', 'clients'],
				['create', 'read', 'update', 'delete']
			);
			// Full access to Settings (General & Organization)
			const settingsPerms = filterPerms(
				createdPermissions,
				['settings'],
				['create', 'read', 'update', 'delete']
			);

			rolePerms = [...comproPerms, ...settingsPerms];
		}

		// INTERNSHIP
		else if (roleName === 'internship') {
			// Basic read-only access for internship
			const basicRead = filterPerms(createdPermissions, ['news', 'projects', 'tasks'], ['read']);

			rolePerms = [...basicRead];
		}

		// GENERAL / DEFAULT
		else {
			// Basic access for others (cleaning-service, etc)
			// Read News, Create Leave Request, Read Profile (implied usually)
			const basic = filterPerms(createdPermissions, ['news'], ['read']);
			const selfService = filterPerms(createdPermissions, ['leave_requests'], ['create', 'read']);

			rolePerms = [...basic, ...selfService];
		}

		// Remove duplicates
		rolePerms = [...new Set(rolePerms)];

		if (rolePerms.length > 0) {
			console.log(`Assigning ${rolePerms.length} permissions to ${roleName}`);
			await permissionService.syncRolePermissions(role.id, rolePerms);
		}
	}

	console.log('Permissions seeded and assigned.');
}

// Helper to filter permissions by resource and action
function filterPerms(
	allPerms: { id: string; name: string }[],
	targetResources: string[],
	targetActions: string[]
): string[] {
	return allPerms
		.filter((p) => {
			const [res, act] = p.name.split('.');
			return targetResources.includes(res) && targetActions.includes(act);
		})
		.map((p) => p.id);
}
