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
	<title>Purchase Orders | ERP</title>
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				Purchase Orders
			</h2>
			<p class="text-muted-foreground">Manage your RFQs and Purchase Orders.</p>
		</div>
		<div class="flex items-center gap-2">
			<Button href={localizeHref('/panel/purchase/orders/create')} size="sm" variant="outline"
				><Plus class="mr-2 h-4 w-4" /> Create RFQ</Button
			>
		</div>
	</div>
	<Separator />

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">Number</Table.Head>
					<Table.Head>Date</Table.Head>
					<Table.Head>Supplier</Table.Head>
					<Table.Head class="text-right">Total</Table.Head>
					<Table.Head>State</Table.Head>
					<Table.Head class="text-right">Action</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.orders as order (order.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{order.number}</Table.Cell>
						<Table.Cell>{new Date(order.date || new Date()).toLocaleDateString()}</Table.Cell>
						<Table.Cell>{order.supplier?.name || '-'}</Table.Cell>
						<Table.Cell class="text-right">{Number(order.total).toLocaleString()}</Table.Cell>
						<Table.Cell>
							<Badge variant="outline" class="capitalize">{order.state}</Badge>
						</Table.Cell>
						<Table.Cell class="text-right">
							<Button
								variant="ghost"
								size="sm"
								href={localizeHref(`/panel/purchase/orders/${order.id}`)}>View</Button
							>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={6} class="h-24 text-center">No purchase orders found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
