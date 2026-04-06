<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	interface Presence {
		id: string;
		fingerprint: string | null;
		time: string | Date;
		category: 'in' | 'out';
		type: 'offline' | 'online' | null;
		late: number | null;
		overtime: number | null;
		earlier: number | null;
		piece: string | number | null;
		price: string | number | null;
	}

	let {
		data
	}: {
		data: PageData & {
			presences: Presence[];
			count: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	} = $props();

	let isLoading = $state(false);
	let searchTimer: NodeJS.Timeout;

	function handleSearch(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			const url = new URL($page.url);
			url.searchParams.set('search', value);
			url.searchParams.set('page', '1');
			goto(url, { keepFocus: true });
		}, 500);
	}

	function handleMonthChange(value: string) {
		const url = new URL($page.url);
		if (value && value !== 'all') {
			url.searchParams.set('month', value);
		} else {
			url.searchParams.delete('month');
		}
		url.searchParams.set('page', '1');
		goto(url);
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > data.totalPages) return;
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		goto(url);
	}

	async function handleClockIn() {
		isLoading = true;
		try {
			const payload = {
				fingerprint: 'TEST-FP-UI',
				time: new Date().toISOString(),
				category: 'in'
			};

			const response = await fetch('/api/presences', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.error || 'Failed to clock in');
			}

			toast.success('Clock In Successful');
			await invalidateAll();
		} catch (e: unknown) {
			if (e instanceof Error) {
				toast.error(e.message);
			} else {
				toast.error('An unknown error occurred');
			}
		} finally {
			isLoading = false;
		}
	}

	function handleExportCsv() {
		const url = new URL('/api/presence/export', window.location.origin);
		const month = $page.url.searchParams.get('month');
		const year = $page.url.searchParams.get('year') || new Date().getFullYear().toString();
		if (month) url.searchParams.set('month', month);
		if (year) url.searchParams.set('year', year);
		window.open(url.toString(), '_blank');
	}
</script>

<svelte:head>
	<title>Presence Data</title>
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				Presence Data
			</h2>
			<p class="text-muted-foreground">Total Records: {data.count}</p>
		</div>
		<div class="flex items-center gap-2">
			<Button size="sm" variant="outline" onclick={handleExportCsv}>Export CSV</Button>
			<Button size="sm" onclick={handleClockIn} disabled={isLoading}>
				{isLoading ? 'Processing...' : 'Simulate Clock In'}
			</Button>
		</div>
	</div>
	<Separator />

	<div class="flex items-center gap-4">
		<Input
			placeholder="Search fingerprint..."
			class="h-8 w-[150px] lg:w-[250px]"
			oninput={handleSearch}
			defaultValue={$page.url.searchParams.get('search') ?? ''}
		/>

		<div class="w-[180px]">
			<Select.Root type="single" onValueChange={handleMonthChange}>
				<Select.Trigger>
					{$page.url.searchParams.get('month')
						? `Month: ${$page.url.searchParams.get('month')}`
						: 'Filter by Month'}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">All Months</Select.Item>
					{#each Array.from({ length: 12 }, (_, i) => i + 1) as m (m)}
						<Select.Item value={m.toString()}
							>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</Select.Item
						>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Fingerprint</Table.Head>
					<Table.Head>Time</Table.Head>
					<Table.Head>Category</Table.Head>
					<Table.Head>Type</Table.Head>
					<Table.Head>Late (Min)</Table.Head>
					<Table.Head>Overtime (Min)</Table.Head>
					<Table.Head>Earlier (Min)</Table.Head>
					<Table.Head>Piece</Table.Head>
					<Table.Head class="text-right">Price</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.presences as item (item.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{item.fingerprint}</Table.Cell>
						<Table.Cell>{new Date(item.time).toLocaleString()}</Table.Cell>
						<Table.Cell>
							<span
								class={item.category === 'in'
									? 'font-bold text-green-600'
									: 'font-bold text-red-600'}
							>
								{item.category.toUpperCase()}
							</span>
						</Table.Cell>
						<Table.Cell>{item.type}</Table.Cell>
						<Table.Cell class={(item.late ?? 0) > 0 ? 'font-bold text-red-500' : ''}
							>{item.late ?? '-'}</Table.Cell
						>
						<Table.Cell class={(item.overtime ?? 0) > 0 ? 'font-bold text-green-500' : ''}
							>{item.overtime ?? '-'}</Table.Cell
						>
						<Table.Cell class={(item.earlier ?? 0) > 0 ? 'font-bold text-orange-500' : ''}
							>{item.earlier ?? '-'}</Table.Cell
						>
						<Table.Cell>{item.piece}</Table.Cell>
						<Table.Cell class="text-right">{item.price}</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={7} class="h-24 text-center">No presence data found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Pagination Controls -->
	<div class="flex items-center justify-end space-x-2 py-4">
		<div class="text-muted-foreground flex-1 text-sm">
			Page {data.page} of {data.totalPages}
		</div>
		<Button
			variant="outline"
			size="sm"
			onclick={() => handlePageChange(data.page - 1)}
			disabled={data.page <= 1}
		>
			Previous
		</Button>
		<Button
			variant="outline"
			size="sm"
			onclick={() => handlePageChange(data.page + 1)}
			disabled={data.page >= data.totalPages}
		>
			Next
		</Button>
	</div>
</div>
