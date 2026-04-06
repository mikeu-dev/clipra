<script lang="ts">
	import DateRangePicker from '$lib/components/analytics/DateRangePicker.svelte';
	import { analyticsStore } from '$lib/stores/analytics.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Banknote from '@lucide/svelte/icons/banknote';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import Rocket from '@lucide/svelte/icons/rocket';
	import RevenueExpenseChart from '$lib/components/analytics/financial/RevenueExpenseChart.svelte';
	import ExpenseBreakdown from '$lib/components/analytics/financial/ExpenseBreakdown.svelte';
	import ProjectHealth from '$lib/components/analytics/project/ProjectHealth.svelte';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';

	let loading = $state(false);
	/* eslint-disable @typescript-eslint/no-explicit-any */
	let financialData = $state<any>(null);

	$effect(() => {
		const range = analyticsStore.range;
		fetchData(range.start, range.end);
	});

	async function fetchData(start: Date, end: Date) {
		loading = true;
		try {
			const res = await fetch(
				`/api/analytics/financial?start=${start.toISOString()}&end=${end.toISOString()}`
			);
			if (res.ok) {
				financialData = await res.json();
			}
		} catch (error) {
			console.error('Failed to fetch analytics:', error);
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.analytics_title()}
			</h1>
			<p class="text-muted-foreground">{m.analytics_desc()}</p>
		</div>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				onclick={() => {
					const range = analyticsStore.range;
					window.location.href = `/api/analytics/export?start=${range.start.toISOString()}&end=${range.end.toISOString()}&type=financial`;
				}}
			>
				{m.analytics_download_report()}
			</Button>
			<DateRangePicker />
		</div>
	</div>

	{#if loading}
		<div class="flex h-[400px] w-full items-center justify-center">
			<Loader2 class="text-muted-foreground h-8 w-8 animate-spin" />
		</div>
	{:else if financialData}
		<!-- KPI Cards Section -->
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">{m.analytics_total_revenue()}</CardTitle>
					<div class="text-muted-foreground">
						<Banknote class="size-4" />
					</div>
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">
						{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
							financialData.kpi.totalRevenue
						)}
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">{m.analytics_total_expenses()}</CardTitle>
					<div class="text-muted-foreground">
						<CreditCard class="size-4" />
					</div>
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">
						{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
							financialData.kpi.totalExpenses
						)}
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">{m.analytics_net_profit()}</CardTitle>
					<div class="text-muted-foreground">
						<TrendingUp class="size-4" />
					</div>
				</CardHeader>
				<CardContent>
					<div
						class={cn(
							'text-2xl font-bold',
							financialData.kpi.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
						)}
					>
						{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
							financialData.kpi.netProfit
						)}
					</div>
					<p class="text-muted-foreground text-xs">
						{m.analytics_margin()}: {financialData.kpi.margin.toFixed(1)}%
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">{m.analytics_active_projects()}</CardTitle>
					<div class="text-muted-foreground">
						<Rocket class="size-4" />
					</div>
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{financialData.projects?.kpi?.totalProjects || 0}</div>
				</CardContent>
			</Card>
		</div>

		<!-- Charts Section -->
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
			<Card class="col-span-4">
				<CardHeader>
					<CardTitle>{m.analytics_revenue_vs_expenses()}</CardTitle>
					<CardDescription>{m.analytics_revenue_vs_expenses_desc()}</CardDescription>
				</CardHeader>
				<CardContent class="pl-2">
					<div class="h-[300px]">
						<RevenueExpenseChart data={financialData} />
					</div>
				</CardContent>
			</Card>
			<Card class="col-span-3">
				<CardHeader>
					<CardTitle>{m.analytics_expense_breakdown()}</CardTitle>
					<CardDescription>{m.analytics_expense_breakdown_desc()}</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="h-[300px]">
						<ExpenseBreakdown data={financialData.expensesByCategory} />
					</div>
				</CardContent>
			</Card>
			<Card class="col-span-3">
				<CardHeader>
					<CardTitle>{m.analytics_project_health()}</CardTitle>
					<CardDescription>{m.analytics_project_health_desc()}</CardDescription>
				</CardHeader>
				<CardContent>
					<ProjectHealth data={financialData.projects} />
				</CardContent>
			</Card>
		</div>
	{/if}
</div>
