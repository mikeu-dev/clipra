<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import Download from '@lucide/svelte/icons/download';

	let { data } = $props();
</script>

<div class="flex flex-col gap-4 p-4 md:p-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">Reporting</h2>
			<p class="text-muted-foreground">Financial and Operational Insights.</p>
		</div>
		<div class="flex gap-2">
			<!-- Placeholders for download actions -->
			<Button variant="outline" href="/panel/reporting/download?type=financial" target="_blank">
				<Download class="mr-2 h-4 w-4" /> Financial Summary
			</Button>
			<Button variant="outline" href="/panel/reporting/download?type=project" target="_blank">
				<Download class="mr-2 h-4 w-4" /> Project Data
			</Button>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Total Income</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-green-600">
					{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
						data.financialReport.income
					)}
				</div>
				<p class="text-muted-foreground text-xs">Based on paid invoices</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Total Expenses</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-red-600">
					{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
						data.financialReport.expense
					)}
				</div>
				<p class="text-muted-foreground text-xs">Approved & Paid expenses</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Net Profit</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-primary text-2xl font-bold">
					{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
						data.financialReport.profit
					)}
				</div>
				<p class="text-muted-foreground text-xs">Income - Expenses</p>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Payroll Cost</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
						data.payrollSummary.totalCost
					)}
				</div>
				<p class="text-muted-foreground text-xs">
					{data.payrollSummary.employeeCount} Payslips Generated
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Attendance</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{data.attendanceSummary.totalPresences}
					<span class="text-muted-foreground text-sm font-normal">Log</span>
				</div>
				<p class="text-muted-foreground text-xs">
					{data.attendanceSummary.totalLateMinutes} Total Late Minutes
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Management Export</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2">
				<Button
					variant="outline"
					size="sm"
					href="/panel/reporting/download?type=payroll"
					target="_blank"
					class="w-full justify-start"
				>
					<Download class="mr-2 h-4 w-4" /> Download Payroll
				</Button>
				<Button
					variant="outline"
					size="sm"
					href="/panel/reporting/download?type=attendance"
					target="_blank"
					class="w-full justify-start"
				>
					<Download class="mr-2 h-4 w-4" /> Download Attendance
				</Button>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-4 md:grid-cols-1">
		<Card.Root>
			<Card.Header>
				<Card.Title>Project Profitability</Card.Title>
				<Card.Description
					>Profit margins per project based on revenue and expenses.</Card.Description
				>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Project</Table.Head>
							<Table.Head>Client</Table.Head>
							<Table.Head>Income</Table.Head>
							<Table.Head>Expense</Table.Head>
							<Table.Head>Profit</Table.Head>
							<Table.Head>Margin</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.projectProfitability as p (p.id)}
							<Table.Row>
								<Table.Cell class="font-medium">{p.name}</Table.Cell>
								<Table.Cell>{p.clientName || '-'}</Table.Cell>
								<Table.Cell
									>{new Intl.NumberFormat('id-ID', {
										style: 'currency',
										currency: 'IDR',
										maximumFractionDigits: 0
									}).format(p.income)}</Table.Cell
								>
								<Table.Cell
									>{new Intl.NumberFormat('id-ID', {
										style: 'currency',
										currency: 'IDR',
										maximumFractionDigits: 0
									}).format(p.expense)}</Table.Cell
								>
								<Table.Cell class={p.profit >= 0 ? 'text-green-600' : 'text-red-600'}
									>{new Intl.NumberFormat('id-ID', {
										style: 'currency',
										currency: 'IDR',
										maximumFractionDigits: 0
									}).format(p.profit)}</Table.Cell
								>
								<Table.Cell>{p.margin.toFixed(2)}%</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={6} class="h-24 text-center"
									>No active project data found.</Table.Cell
								>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	</div>
</div>
