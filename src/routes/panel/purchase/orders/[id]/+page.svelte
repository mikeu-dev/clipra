<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	let order = $derived(data.order);
</script>

<div class="space-y-6 p-10 pb-16">
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{order.number}
			</h2>
			<p class="text-muted-foreground">
				Date: {new Date(order.date).toLocaleDateString()} | Supplier: {order.supplier?.name}
			</p>
			{#if order.project}
				<p class="text-sm font-medium text-blue-600">
					Project: {order.project.name}
				</p>
			{/if}
			<p class="text-muted-foreground text-sm">
				State: <span class="font-semibold uppercase">{order.state}</span>
			</p>
		</div>
		<div class="flex space-x-2">
			{#if order.state === 'draft'}
				<form
					action="?/confirm"
					method="POST"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								toast.success(m.toast_success_order_confirmed());
							}
						};
					}}
				>
					<Button type="submit">Confirm Order</Button>
				</form>
			{/if}
			{#if order.state === 'purchase'}
				<form
					action="?/receiveProducts"
					method="POST"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								toast.success('Products received and stock updated');
							} else {
								toast.error('Failed to receive products');
							}
						};
					}}
				>
					<Button type="submit">Receive Products</Button>
				</form>
				<form
					action="?/createBill"
					method="POST"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								// toast.success('Bill created');
								if (result.data && result.data.message) toast.error(String(result.data.message));
							} else {
								toast.error('Failed to create bill');
							}
						};
					}}
				>
					<Button variant="outline" type="submit">Create Vendor Bill</Button>
				</form>
			{/if}
			<Button variant="outline" href={`/api/purchase/orders/${order.id}/pdf`} target="_blank">
				Download PDF
			</Button>
		</div>
	</div>

	<Separator />

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Supplier Details</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<p><strong>Name:</strong> {order.supplier?.name || order.supplierId}</p>

				{#if order.bills && order.bills.length > 0}
					<div class="mt-4 border-t pt-4">
						<h4 class="mb-2 text-sm font-semibold">Linked Vendor Bill</h4>
						{#each order.bills as bill (bill.id)}
							<div class="bg-muted/50 flex items-center justify-between rounded-md p-2">
								<span class="text-sm font-medium">{bill.number}</span>
								<Badge variant="outline" class="capitalize">{bill.status}</Badge>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Order Summary</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex justify-between">
					<span>Subtotal:</span>
					<span>{Number(order.subtotal).toLocaleString()}</span>
				</div>
				<div class="flex justify-between">
					<span>Tax:</span>
					<span>{Number(order.taxTotal).toLocaleString()}</span>
				</div>
				<div class="flex justify-between font-bold">
					<span>Total:</span>
					<span>{Number(order.total).toLocaleString()}</span>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Order Lines -->
	<h3 class="text-lg font-medium">Order Lines</h3>
	<div class="rounded-md border">
		<table class="w-full text-left text-sm">
			<thead class="bg-muted/50 border-b">
				<tr>
					<th class="p-3">Product</th>
					<th class="p-3">Unit</th>
					<th class="p-3">Quantity</th>
					<th class="p-3">Unit Price</th>
					<th class="p-3">Subtotal</th>
				</tr>
			</thead>
			<tbody>
				{#each order.lines as line (line.id)}
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
						<td class="p-3">{line.product?.unit || '-'}</td>
						<td class="p-3">{Number(line.quantity).toLocaleString()}</td>
						<td class="p-3">{Number(line.unitPrice).toLocaleString()}</td>
						<td class="p-3">{Number(line.subtotal).toLocaleString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
