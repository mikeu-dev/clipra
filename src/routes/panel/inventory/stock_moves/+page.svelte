<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Plus from '@lucide/svelte/icons/plus';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();
</script>

<svelte:head>
	<title>Stock Moves | ERP</title>
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				Stock Moves
			</h2>
			<p class="text-muted-foreground">Track all product movements.</p>
		</div>
		<div class="flex items-center gap-2">
			<Button href={localizeHref('/panel/inventory/stock_moves/create')} size="sm" variant="outline"
				><Plus class="mr-2 h-4 w-4" /> Move Stock</Button
			>
		</div>
	</div>
	<Separator />

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">Reference</Table.Head>
					<Table.Head>Date</Table.Head>
					<Table.Head>Product</Table.Head>
					<Table.Head>From</Table.Head>
					<Table.Head>To</Table.Head>
					<Table.Head class="text-right">Quantity</Table.Head>
					<Table.Head>State</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.moves as move (move.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{move.reference || '-'}</Table.Cell>
						<Table.Cell>{move.date ? new Date(move.date).toLocaleDateString() : '-'}</Table.Cell>
						<Table.Cell>{move.product?.name}</Table.Cell>
						<Table.Cell>{move.sourceLocation?.name}</Table.Cell>
						<Table.Cell>{move.destLocation?.name}</Table.Cell>
						<Table.Cell class="text-right">{Number(move.quantity)}</Table.Cell>
						<Table.Cell>
							<Badge variant="outline" class="capitalize">{move.state}</Badge>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={7} class="h-24 text-center">No stock moves found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
