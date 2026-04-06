import type { RequestHandler } from './$types';
import { PayrollModule } from '$lib/server/modules/payroll/module';
import { error } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

const payrollService = PayrollModule.getService();

function formatCurrency(amount: string | number | null): string {
	if (!amount) return 'Rp 0';
	const num = typeof amount === 'string' ? parseFloat(amount) : amount;
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0
	}).format(num);
}

export const GET: RequestHandler = async ({ url }) => {
	const payrollId = url.searchParams.get('id');

	if (!payrollId) {
		throw error(400, 'Payroll ID required');
	}

	const data = await payrollService.getPayrollById(payrollId);
	if (!data) {
		throw error(404, 'Payroll not found');
	}

	const { payroll, employee, user } = data;
	const details = (payroll.details as Record<string, unknown>) || {};
	const components =
		(details.components as Array<{ name: string; amount: number; type: string }>) || [];

	const componentRows = components
		.map(
			(comp) => `
		<tr>
			<td>${comp.name}</td>
			<td class="amount ${comp.type === 'allowance' ? 'allowance' : 'deduction'}">
				${comp.type === 'allowance' ? '+' : '-'}${formatCurrency(comp.amount)}
			</td>
		</tr>
	`
		)
		.join('');

	const htmlContent = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>${m.payslip_title()} - ${user.name}</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #f5f5f5; }
		.slip { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
		.header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
		.header h1 { font-size: 24px; margin-bottom: 5px; text-transform: uppercase; }
		.header p { color: #666; }
		.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
		.info-box { background: #f9f9f9; padding: 15px; border-radius: 8px; }
		.info-box label { font-size: 12px; color: #666; display: block; margin-bottom: 5px; }
		.info-box span { font-weight: 600; font-size: 16px; }
		table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
		th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
		th { background: #f9f9f9; font-weight: 600; }
		.amount { text-align: right; font-family: monospace; }
		.allowance { color: #22c55e; }
		.deduction { color: #ef4444; }
		.total-row { font-weight: bold; background: #f0f9ff; }
		.total-row td { border-top: 2px solid #333; font-size: 18px; }
		.footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
		.attendance { background: #fffbeb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
		.attendance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; }
		.attendance-item span { display: block; font-size: 24px; font-weight: bold; }
		.attendance-item label { font-size: 12px; color: #666; }
		.print-btn { position: fixed; bottom: 20px; right: 20px; background: #333; color: white; border: none; padding: 15px 25px; border-radius: 8px; cursor: pointer; font-size: 16px; }
		@media print {
			body { padding: 0; background: white; }
			.slip { box-shadow: none; }
			.print-btn { display: none; }
		}
	</style>
</head>
<body>
	<button class="print-btn" onclick="window.print()">${m.btn_print_pdf()}</button>
	<div class="slip">
		<div class="header">
			<h1>${m.payslip_title()}</h1>
			<p>${m.payslip_period()}: ${details.period || '-'}</p>
		</div>

		<div class="info-grid">
			<div class="info-box">
				<label>${m.payslip_employee_name()}</label>
				<span>${user.name}</span>
			</div>
			<div class="info-box">
				<label>${m.payslip_nik()}</label>
				<span>${employee.nik || '-'}</span>
			</div>
			<div class="info-box">
				<label>${m.payslip_status()}</label>
				<span>${payroll.status}</span>
			</div>
			<div class="info-box">
				<label>${m.payslip_print_date()}</label>
				<span>${new Date().toLocaleDateString('id-ID')}</span>
			</div>
		</div>

		${
			details.presentDays !== undefined
				? `
		<div class="attendance">
			<h3 style="margin-bottom: 10px; font-size: 14px; color: #666;">${m.payslip_attendance()}</h3>
			<div class="attendance-grid">
				<div class="attendance-item">
					<span>${details.presentDays || 0}</span>
					<label>${m.payslip_present()}</label>
				</div>
				<div class="attendance-item">
					<span>${details.absentDays || 0}</span>
					<label>${m.payslip_absent()}</label>
				</div>
				<div class="attendance-item">
					<span>${details.workingDaysInMonth || 22}</span>
					<label>${m.payslip_workdays()}</label>
				</div>
			</div>
		</div>
		`
				: ''
		}

		<table>
			<thead>
				<tr>
					<th>${m.payslip_component()}</th>
					<th class="amount">${m.payslip_amount()}</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><strong>${m.payslip_base_salary()}</strong></td>
					<td class="amount">${formatCurrency(payroll.baseSalary)}</td>
				</tr>
				${componentRows}
			</tbody>
			<tfoot>
				<tr>
					<td>${m.payslip_total_allowance()}</td>
					<td class="amount allowance">+${formatCurrency(payroll.totalAllowance)}</td>
				</tr>
				<tr>
					<td>${m.payslip_total_deduction()}</td>
					<td class="amount deduction">-${formatCurrency(payroll.totalDeduction)}</td>
				</tr>
				<tr class="total-row">
					<td>${m.payslip_net_salary()}</td>
					<td class="amount">${formatCurrency(payroll.netSalary)}</td>
				</tr>
			</tfoot>
		</table>

		<div class="footer">
			<p>${m.payslip_footer_1()}</p>
			<p>${m.payslip_footer_2()}</p>
		</div>
	</div>
</body>
</html>
	`;

	return new Response(htmlContent, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8'
		}
	});
};
