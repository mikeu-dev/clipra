import { describe, it, expect, vi, beforeEach } from 'vitest';
// We mock module paths relative to the test file or using absolute paths as configured in vitest
// Since we are not sure if $lib alias works in this test setup (depends on vitest.config), we will try to use it.
// If it fails, we fix it.

// Mock the database dependency
const mockDb = {
	select: vi.fn(),
	from: vi.fn(),
	innerJoin: vi.fn(),
	where: vi.fn(),
	limit: vi.fn(),
	insert: vi.fn().mockReturnValue({ values: vi.fn() })
};

// Chain helper
// function createMockQueryBuilder(returnValue: any) {
// 	const builder = {
// 		from: vi.fn().mockReturnThis(),
// 		innerJoin: vi.fn().mockReturnThis(),
// 		where: vi.fn().mockReturnThis(),
// 		limit: vi.fn().mockReturnThis(),
// 		then: (resolve: any) => resolve(returnValue)
// 	};
// 	return builder;
// }

// We need to intercept the imports.
// Note: We are mocking the module that exports 'db'.
vi.mock('$lib/server/database', () => ({
	db: {
		select: vi.fn((...args) => {
			// We can return a specific mock builder based on some state,
			// but since the chain is constructed, we might need to rely on the 'from' call to distinguish.
			// A common pattern is to just return a shared builder that we spy on,
			// OR use mock implementations that check arguments.
			return mockDb.select(...args);
		}),
		insert: vi.fn((...args) => mockDb.insert(...args))
	}
}));

// Mock repositories
const mockPayrollRepo = {
	create: vi.fn(),
	findByBatchId: vi.fn(),
	updateGatewayInfo: vi.fn(),
	update: vi.fn()
};
const mockBatchRepo = {
	create: vi.fn(),
	findAllByCompanyId: vi.fn(),
	findById: vi.fn(),
	update: vi.fn()
};

vi.mock('./repository', () => ({
	PayrollBatchRepository: vi.fn().mockImplementation(() => mockBatchRepo),
	PayrollRepository: vi.fn().mockImplementation(() => mockPayrollRepo)
}));

const mockUpdateGatewayInfo = mockPayrollRepo.updateGatewayInfo;
const mockUpdatePayroll = mockPayrollRepo.update;
const mockUpdateBatch = mockBatchRepo.update;
const mockFindBatchById = mockBatchRepo.findById;
const mockCreatePayroll = mockPayrollRepo.create;
// const mockCreateBatch = mockBatchRepo.create;

import { PayrollService } from './service';

// Mock External Services
const mockCreateDisbursement = vi.fn();
vi.mock('./payment-gateways/factory', () => ({
	PaymentGatewayFactory: {
		getProvider: () => ({
			createDisbursement: mockCreateDisbursement
		})
	}
}));

const mockSendPayslip = vi.fn();
vi.mock('../email/service', () => ({
	EmailService: vi.fn().mockImplementation(() => ({
		sendPayslip: mockSendPayslip
	}))
}));

vi.mock('../expense/repository', () => ({
	ExpenseRepository: vi.fn().mockImplementation(() => ({
		create: vi.fn()
	}))
}));

// Mock utils
vi.mock('$lib/utils/useUserId', () => ({
	generateId: () => 'mock-id'
}));

// Helper to setup the fluent chain mock
function setupDbChain(mockDataOrders: unknown[]) {
	// mockDataOrders is an array of data to be returned by sequential queries.
	// This is a naive implementation assuming rigid call order.

	let callIndex = 0;

	// We mock the methods to return "this" until the promise is resolved
	const chain = {
		from: vi.fn().mockReturnThis(),
		innerJoin: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		then: (resolve: (data: unknown) => void) => {
			const data = mockDataOrders[callIndex];
			callIndex++;
			resolve(data);
		}
	};

	mockDb.select.mockReturnValue(chain);
	return chain;
}

describe('PayrollService Calculation', () => {
	let service: PayrollService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new PayrollService();
		// Inject mocks directly to ensure consistent references
		(service as unknown as { payrollRepo: unknown }).payrollRepo = mockPayrollRepo;
		(service as unknown as { batchRepo: unknown }).batchRepo = mockBatchRepo;
	});

	it('should calculate net salary correctly for a standard employee', async () => {
		// We expect the following SQL select calls in order:
		// 1. Employees (Permanent)
		// 2. Employees (Probation)
		// 3. Employee Salary
		// 4. Presence Count
		// 5. Salary Components

		const mockPermanentEmployees = [
			{
				employee: { id: 'emp1', userId: 'user1', companyId: 'comp1', status: 'permanent' },
				user: { id: 'user1', name: 'John Doe' }
			}
		];

		const mockProbationEmployees: unknown[] = [];

		const mockSalary = [{ amount: '5000000' }]; // 5.000.0000 Base

		const mockPresence = [{ count: 22 }]; // Full attendance (22 days)

		const mockComponents = [
			{
				assignment: { amount: '500000' },
				component: { name: 'Transport', type: 'allowance', calculationType: 'fixed' }
			},
			{
				assignment: { amount: '10' }, // 10%
				component: { name: 'Tax', type: 'deduction', calculationType: 'percentage' }
			}
		];

		// Setup the mock chain response sequence
		setupDbChain([
			mockPermanentEmployees,
			mockProbationEmployees,
			mockSalary,
			mockPresence,
			[], // Leaves (Missing in previous test code)
			mockComponents
		]);

		await service.generatePayrollBatch('comp1', 'Jan 2026', new Date('2026-01-01'));

		// Verify Payroll Creation
		expect(mockCreatePayroll).toHaveBeenCalledTimes(1);
		const payload = mockCreatePayroll.mock.calls[0][0];

		expect(payload.employeeId).toBe('emp1');

		// Base: 5,000,000
		// Transport: +500,000
		// Tax (10% of 5M): -500,000
		// Attendance Deduction: 0 (22/22 present)
		// Net: 5,000,000 + 500,000 - 500,000 = 5,000,000

		expect(payload.baseSalary).toBe('5000000.00');
		expect(payload.totalAllowance).toBe('500000.00');
		expect(payload.totalDeduction).toBe('500000.00');
		expect(payload.netSalary).toBe('5000000.00');
	});

	it('should deduct salary for absence', async () => {
		const mockPermanentEmployees = [
			{
				employee: { id: 'emp1', userId: 'user1', companyId: 'comp1', status: 'permanent' },
				user: { id: 'user1', name: 'Absentee' }
			}
		];

		const mockSalary = [{ amount: '4400000' }]; // Base 4.4M (easy calc: 4.4M / 22 = 200k/day)

		// 20 days present, 2 days absent
		const mockPresence = [{ count: 20 }];

		const mockComponents: unknown[] = []; // No extra components

		setupDbChain([
			mockPermanentEmployees,
			[], // Probation
			mockSalary,
			mockPresence,
			[], // Leaves
			mockComponents
		]);

		await service.generatePayrollBatch('comp1', 'Jan 2026', new Date('2026-01-01'));

		const payload = mockCreatePayroll.mock.calls[0][0];

		// Daily Rate = 4,400,000 / 22 = 200,000
		// Absent 2 days = 400,000 deduction

		expect(payload.baseSalary).toBe('4400000.00');
		expect(payload.totalDeduction).toBe('400000.00');
		expect(payload.netSalary).toBe('4000000.00'); // 4.4M - 400k
	});

	describe('Payment Flow', () => {
		it('should set payroll to processing and save gatewayRefId', async () => {
			mockFindBatchById.mockResolvedValue({
				id: 'batch1',
				status: 'processed',
				companyId: 'comp1',
				name: 'Gaji'
			});

			// Mock getPayrollsByBatchId (via repository spy or direct service mock)
			// But service calls this.getPayrollsByBatchId which calls this.payrollRepo.findByBatchId
			const mockPayrolls = [
				{
					payroll: { id: 'pay1', netSalary: '1000' },
					employee: { bankName: 'BCA', bankAccountNumber: '123' },
					user: { name: 'John', email: 'john@example.com' }
				}
			];
			vi.spyOn(service, 'getPayrollsByBatchId').mockResolvedValue(
				mockPayrolls as unknown as Awaited<ReturnType<typeof service.getPayrollsByBatchId>>
			);

			// Mock DB for Bank Lookup
			setupDbChain([[{ code: 'BCA001' }]]);

			mockCreateDisbursement.mockResolvedValue({ id: 'gw-ref-1', status: 'pending' });

			const result = await service.processBatchPayment('batch1');

			expect(result.success).toBe(true);
			expect(mockUpdateGatewayInfo).toHaveBeenCalledWith('pay1', { status: 'processing' });
			expect(mockUpdateGatewayInfo).toHaveBeenCalledWith('pay1', {
				gatewayRefId: 'gw-ref-1',
				gatewayStatus: 'pending'
			});
			expect(mockUpdateBatch).toHaveBeenCalledWith('batch1', { status: 'processed' });
		});

		it('should handle webhook success and send email', async () => {
			const mockPayrollData = {
				payroll: {
					id: 'pay1',
					batchId: 'batch1',
					netSalary: '1000',
					status: 'processing',
					createdAt: new Date()
				},
				user: { name: 'John', email: 'john@example.com' },
				employee: { userId: 'user1', companyId: 'comp1' }
			};
			const mockFinishedPayroll = {
				...mockPayrollData,
				payroll: { ...mockPayrollData.payroll, status: 'paid' }
			};

			vi.spyOn(service, 'getPayrollById').mockResolvedValue(
				mockPayrollData as unknown as Awaited<ReturnType<typeof service.getPayrollById>>
			);
			vi.spyOn(service, 'getPayrollsByBatchId').mockResolvedValue([
				mockFinishedPayroll
			] as unknown as Awaited<ReturnType<typeof service.getPayrollsByBatchId>>);

			await service.handleGatewayWebhook({
				externalId: 'pay1',
				status: 'success',
				gatewayStatus: 'settlement'
			});

			expect(mockUpdateGatewayInfo).toHaveBeenCalledWith('pay1', {
				status: 'paid',
				gatewayStatus: 'settlement'
			});
			expect(mockUpdatePayroll).toHaveBeenCalledWith(
				'pay1',
				expect.objectContaining({ paidAt: expect.any(Date) })
			);
			expect(mockSendPayslip).toHaveBeenCalled();
			expect(mockUpdateBatch).toHaveBeenCalledWith('batch1', { status: 'paid' });
		});
	});
});
