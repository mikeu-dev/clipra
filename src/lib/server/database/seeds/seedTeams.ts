import { teams as teamsData } from '../../../config/app';
import { UserService } from '../../../server/modules/user/service';
import { RoleService } from '../../../server/modules/role/service';
import { db } from '../index';
import { userProfiles, positions, employees } from '../schemas';
import { generateId } from '../../../utils/useUserId';
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';

const roleService = new RoleService();
const userService = new UserService();

export async function seedTeams() {
	console.log('Seeding teams (users & profiles)...');

	if (!process.env.PASSWORD_DEFAULT) {
		console.warn('PASSWORD_DEFAULT not set, using default');
	}
	const passwordDefault = process.env.PASSWORD_DEFAULT || 'password123';
	const passwordHash = await hash(passwordDefault, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	// Get a default role for team members, e.g. 'Staff' or 'Employee'.
	// If not exists, use 'Viewer' or create one?
	// Let's use 'Superadmin' or 'Admin' if we want them to have access, but for purely display, maybe a new role?
	// For now, let's assign them 'Admin' or 'Staff' if exists.
	const roles = await roleService.getAllRoles();
	const employeeRole =
		roles.find((r) => r.name.toLowerCase() === 'employee') ||
		roles.find((r) => r.name.toLowerCase() === 'admin') ||
		roles[0]; // Fallback

	// Get Default Company
	const company = await db.query.companies.findFirst({
		where: (t, { eq }) => eq(t.code, 'SUP-001')
	});

	if (!company) {
		console.error('Default company not found. Skipping team seeding.');
		return;
	}

	// Check wether the shift exists or not
	const shift = await db.query.shifts.findFirst();

	// Map to store config ID -> DB Employee ID for hierarchy linking
	const configIdToEmployeeId: Record<string, string> = {};

	// First pass: Create users, profiles, and employee records
	for (const member of teamsData) {
		// ... existing logic to find/create user and position ...
		const safeName = member.name.toLowerCase().replace(/[^a-z0-9]/g, '');
		const username = safeName.slice(0, 15);
		const email = `${username}@supplyra.example.com`;

		let userId: string;
		const existingUser = await userService.getByEmail(email);
		if (!existingUser) {
			const newUser = await userService.create({
				roleId: employeeRole!.id,
				name: member.name,
				username: username,
				email: email,
				passwordHash: passwordHash,
				emailVerified: true
			});
			userId = newUser.id;
		} else {
			userId = existingUser.id;
		}

		const existingProfile = await db.query.userProfiles.findFirst({
			where: (t, { eq }) => eq(t.userId, userId)
		});
		if (!existingProfile) {
			await db.insert(userProfiles).values({
				id: generateId(),
				userId: userId,
				avatar: member.image
			});
		}

		let positionId: string;
		const existingPosition = await db.query.positions.findFirst({
			where: (t, { and, eq }) => and(eq(t.companyId, company.id), eq(t.name, member.position))
		});
		if (!existingPosition) {
			const newPositionId = generateId();
			await db.insert(positions).values({
				id: newPositionId,
				companyId: company.id,
				name: member.position
			});
			positionId = newPositionId;
		} else {
			positionId = existingPosition.id;
		}

		const existingEmployee = await db.query.employees.findFirst({
			where: (t, { eq }) => eq(t.userId, userId)
		});

		let currentEmployeeId: string;
		if (existingEmployee) {
			currentEmployeeId = existingEmployee.id;
			await db
				.update(employees)
				.set({
					positionId: positionId,
					division: member.division,
					updatedAt: new Date()
				})
				.where(eq(employees.id, existingEmployee.id));
		} else if (shift) {
			currentEmployeeId = generateId();
			const randomSuffix = Math.floor(Math.random() * 10000)
				.toString()
				.padStart(4, '0');

			await db.insert(employees).values({
				id: currentEmployeeId,
				userId: userId,
				companyId: company.id,
				positionId: positionId,
				shiftId: shift.id,
				division: member.division,
				idCard: `EMP${randomSuffix}`,
				nik: `320101${randomSuffix}0001`,
				joinDate: new Date().toISOString().split('T')[0],
				status: 'permanent',
				workEmail: email,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		} else {
			continue;
		}

		configIdToEmployeeId[member.id] = currentEmployeeId;
	}

	// Second pass: Update reports_to linking
	console.log('Linking reporting hierarchy...');
	for (const member of teamsData) {
		if (member.reportsTo && configIdToEmployeeId[member.reportsTo]) {
			const employeeId = configIdToEmployeeId[member.id];
			const reportsToId = configIdToEmployeeId[member.reportsTo];

			await db
				.update(employees)
				.set({ reportsTo: reportsToId })
				.where(eq(employees.id, employeeId));
		}
	}
}
