import { pgTable, varchar, timestamp, json } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { payrolls } from './payrolls';

export const payrollPaymentLogs = pgTable('payroll_payment_logs', {
	id: varchar('id', { length: 36 }).primaryKey(),
	payrollId: varchar('payroll_id', { length: 36 })
		.notNull()
		.references(() => payrolls.id, { onDelete: 'cascade' }),
	action: varchar('action', { length: 50 }).notNull(), // 'request', 'webhook', 'inquiry', 'error'
	payload: json('payload'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const payrollPaymentLogsRelations = relations(payrollPaymentLogs, ({ one }) => ({
	payroll: one(payrolls, { fields: [payrollPaymentLogs.payrollId], references: [payrolls.id] })
}));
