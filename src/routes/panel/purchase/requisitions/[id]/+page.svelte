<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data } = $props();
	let req = $derived(data.requisition);
	let selectedSupplier = $state('');

	function getStatusVariant(state: string) {
		switch (state) {
			case 'draft':
				return 'secondary';
			case 'requested':
				return 'default';
			case 'approved':
				return 'default';
			case 'rejected':
				return 'destructive';
			case 'ordered':
				return 'outline';
			case 'cancelled':
				return 'outline';
			default:
				return 'outline';
		}
	}
</script>

<div class="space-y-6 p-10 pb-16">
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{req.number}
			</h2>
			<p class="text-muted-foreground">
				Date: {new Date(req.date).toLocaleDateString()} | Requester: {req.requestedBy?.name}
			</p>
			{#if req.project}
				<p class="text-sm font-medium text-blue-600">
					Project: {req.project.name}
				</p>
			{/if}
			<div class="mt-2">
				<Badge variant={getStatusVariant(req.state || '')} class="capitalize">
					{req.state?.replace('_', ' ')}
				</Badge>
			</div>
		</div>
		<div class="flex space-x-2">
			{#if req.state === 'requested'}
				<form action="?/approve" method="POST" use:enhance>
					<Button type="submit">Approve</Button>
				</form>
				<form action="?/reject" method="POST" use:enhance>
					<Button variant="destructive" type="submit">Reject</Button>
				</form>
			{/if}

			{#if req.state === 'approved'}
				<div class="flex items-end gap-2">
					<div class="flex flex-col gap-1">
						<span class="text-muted-foreground text-xs">Select Supplier to Order</span>
						<Select.Root bind:value={selectedSupplier} type="single">
							<Select.Trigger class="w-[200px]">
								{data.suppliers.find((s) => s.id === selectedSupplier)?.name || 'Select Supplier'}
							</Select.Trigger>
							<Select.Content>
								{#each data.suppliers as supplier (supplier.id)}
									<Select.Item value={supplier.id} label={supplier.name} />
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					<form action="?/convertToPO" method="POST" use:enhance>
						<input type="hidden" name="supplierId" value={selectedSupplier} />
						<Button type="submit" disabled={!selectedSupplier}>Create Purchase Order</Button>
					</form>
				</div>
			{/if}
			<Button variant="outline" href={`/api/purchase/requisitions/${req.id}/pdf`} target="_blank">
				Download PDF
			</Button>
		</div>
	</div>

	<Separator />

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Requisition Details</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				<p><strong>Description:</strong> {req.description || '-'}</p>
				<p><strong>Notes:</strong> {req.notes || '-'}</p>
				<p><strong>Total Estimate:</strong> {Number(req.totalAmount).toLocaleString()}</p>
			</Card.Content>
		</Card.Root>

		{#if req.purchaseOrders && req.purchaseOrders.length > 0}
			<Card.Root>
				<Card.Header>
					<Card.Title>Related Purchase Orders</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="space-y-2">
						{#each req.purchaseOrders as po (po.id)}
							<div class="flex items-center justify-between rounded-md border p-2">
								<div class="flex flex-col">
									<a
										href={localizeHref(`/panel/purchase/orders/${po.id}`)}
										class="font-medium text-blue-600 hover:underline"
									>
										{po.number}
									</a>
									<span class="text-muted-foreground text-xs"
										>{new Date(po.date).toLocaleDateString()}</span
									>
								</div>
								<Badge variant="outline" class="capitalize">{po.state}</Badge>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>

	<!-- Requisition Lines -->
	<h3 class="text-lg font-medium">Requested Items</h3>
	<div class="rounded-md border">
		<table class="w-full text-left text-sm">
			<thead class="bg-muted/50 border-b">
				<tr>
					<th class="p-3">Product</th>
					<th class="p-3">Unit</th>
					<th class="p-3 text-right">Quantity</th>
					<th class="p-3 text-right">Est. Unit Price</th>
					<th class="p-3 text-right">Subtotal</th>
				</tr>
			</thead>
			<tbody>
				{#each req.lines as line (line.id)}
					<tr class="border-b last:border-0">
						<td class="p-3">
							<div class="flex items-center gap-3">
								{#if line.product?.image}
									<img
										src={line.product.image}
										alt={line.product.name}
										class="h-10 w-10 rounded-sm object-cover"
									/>
								{:else}
									<div class="bg-muted flex h-10 w-10 items-center justify-center rounded-sm">
										<span class="text-muted-foreground text-[10px]">No Image</span>
									</div>
								{/if}
								<div class="flex flex-col">
									<span class="font-medium">{line.product?.name || 'N/A'}</span>
									<span class="text-muted-foreground text-xs">{line.description}</span>
								</div>
							</div>
						</td>
						<td class="p-3 text-xs">{line.product?.unit || '-'}</td>
						<td class="p-3 text-right">{Number(line.quantity).toLocaleString()}</td>
						<td class="p-3 text-right">{Number(line.estimatedUnitPrice).toLocaleString()}</td>
						<td class="p-3 text-right">{Number(line.subtotal).toLocaleString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
