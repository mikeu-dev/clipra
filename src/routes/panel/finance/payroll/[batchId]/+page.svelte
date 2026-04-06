<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Check from '@lucide/svelte/icons/check';
	import Printer from '@lucide/svelte/icons/printer';
	import Download from '@lucide/svelte/icons/download';
	import CreditCard from '@lucide/svelte/icons/credit-card';

	import type { ActionResult } from '@sveltejs/kit';

	let { data } = $props();
	type PayrollItem = (typeof data.payrolls)[number];

	function handleResult({ result, update }: { result: ActionResult; update: () => Promise<void> }) {
		if (result.type === 'success') {
			toast.success(m.toast_success_updated());
			update();
		} else {
			toast.error(m.toast_error_operation_failed());
		}
	}

	function formatCurrency(amount: string | number | null) {
		if (!amount) return 'Rp 0';
		const num = typeof amount === 'string' ? parseFloat(amount) : amount;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(num);
	}

	function getStatusColor(status: string) {
		if (status === 'paid') return 'default';
		if (status === 'processing') return 'secondary';
		if (status === 'failed') return 'destructive';
		return 'outline';
	}
</script>

<div class="flex flex-col gap-4 p-4">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/panel/finance/payroll">
			<ArrowLeft class="h-5 w-5" />
		</Button>
		<div class="flex-1">
			<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{data.batch.name}
			</h1>
			<p class="text-muted-foreground">
				Period: {new Date(data.batch.period).toLocaleDateString('id-ID', {
					month: 'long',
					year: 'numeric'
				})}
			</p>
		</div>
		<Badge variant={data.batch.status === 'paid' ? 'default' : 'outline'}>{data.batch.status}</Badge
		>
		{#if data.batch.status === 'draft'}
			<form method="POST" action="?/updateBatchStatus" use:enhance={() => handleResult}>
				<input type="hidden" name="status" value="processed" />
				<Button variant="outline">Mark as Processed</Button>
			</form>
		{/if}
		{#if data.batch.status === 'processed'}
			<form method="POST" action="?/processBatch" use:enhance={() => handleResult}>
				<Button class="bg-primary hover:bg-primary/90">
					<CreditCard class="mr-2 h-4 w-4" />
					Proses Pembayaran Gaji
				</Button>
			</form>
		{/if}
		{#if data.batch.status === 'paid'}
			<Button
				variant="outline"
				href="/panel/finance/payroll/{data.batch.id}/export-bank"
				target="_blank"
			>
				<Download class="mr-2 h-4 w-4" />
				File Transfer Bank (CSV)
			</Button>
		{/if}
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Payslips ({data.payrolls.length} employees)</Card.Title>
		</Card.Header>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Employee</Table.Head>
						<Table.Head class="text-right">Base Salary</Table.Head>
						<Table.Head class="text-right">Allowance</Table.Head>
						<Table.Head class="text-right">Deduction</Table.Head>
						<Table.Head class="text-right">Net Salary</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.payrolls as item (item.payroll.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{item.user.name}</Table.Cell>
							<Table.Cell class="text-right">{formatCurrency(item.payroll.baseSalary)}</Table.Cell>
							<Table.Cell class="text-right text-green-600">
								+{formatCurrency(item.payroll.totalAllowance)}
							</Table.Cell>
							<Table.Cell class="text-right text-red-600">
								-{formatCurrency(item.payroll.totalDeduction)}
							</Table.Cell>
							<Table.Cell class="text-right font-bold">
								{formatCurrency(item.payroll.netSalary)}
							</Table.Cell>
							<Table.Cell title={item.payroll.gatewayStatus || ''}>
								<Badge variant={getStatusColor(item.payroll.status || 'pending')}>
									{item.payroll.status}
								</Badge>
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-2 text-right">
									{#if item.payroll.status === 'pending' || item.payroll.status === 'failed'}
										<form
											method="POST"
											action="?/verifyAccount"
											use:enhance={() => {
												return ({ result }) => {
													if (result.type === 'success') {
														toast.success(`Verified: ${result.data?.accountName}`);
													} else {
														toast.error(m.toast_error_verification_failed());
													}
												};
											}}
										>
											<input type="hidden" name="employeeId" value={item.employee.id} />
											<Button type="submit" variant="ghost" size="sm" title="Verify Bank Account">
												<Check class="h-3 w-3" />
											</Button>
										</form>
									{/if}
									{#if item.payroll.status === 'pending' || item.payroll.status === 'failed'}
										<form method="POST" action="?/markPaid" use:enhance={() => handleResult}>
											<input type="hidden" name="payrollId" value={item.payroll.id} />
											<Button type="submit" variant="outline" size="sm">
												<Check class="mr-1 h-3 w-3" /> Pay
											</Button>
										</form>
									{/if}
									<a
										href="/api/payroll/payslip?id={item.payroll.id}"
										target="_blank"
										rel="noopener"
									>
										<Button variant="ghost" size="icon" title="Print Payslip">
											<Printer class="h-4 w-4" />
										</Button>
									</a>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
					{#if data.payrolls.length === 0}
						<Table.Row>
							<Table.Cell colspan={7} class="text-muted-foreground py-8 text-center">
								No payslips in this batch.
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<!-- Summary Card -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Summary</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4 md:grid-cols-4">
				<div>
					<p class="text-muted-foreground text-sm">Total Employees</p>
					<p class="text-2xl font-bold">{data.payrolls.length}</p>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Total Base Salary</p>
					<p class="text-2xl font-bold">
						{formatCurrency(
							data.payrolls.reduce(
								(sum: number, p: PayrollItem) => sum + parseFloat(p.payroll.baseSalary || '0'),
								0
							)
						)}
					</p>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Total Net Payout</p>
					<p class="text-2xl font-bold text-green-600">
						{formatCurrency(
							data.payrolls.reduce(
								(sum: number, p: PayrollItem) => sum + parseFloat(p.payroll.netSalary || '0'),
								0
							)
						)}
					</p>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Paid</p>
					<p class="text-2xl font-bold">
						{data.payrolls.filter((p: PayrollItem) => p.payroll.status === 'paid').length} / {data
							.payrolls.length}
					</p>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
