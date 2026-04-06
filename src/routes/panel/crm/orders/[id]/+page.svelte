<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import Rocket from '@lucide/svelte/icons/rocket';
	import FileText from '@lucide/svelte/icons/file-text';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';

	import type { PageData } from './$types';
	let { data } = $props<{ data: PageData }>();
	let order = $derived(data.order);
</script>

<div class="space-y-6 p-10 pb-16">
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{order.number}
			</h2>
			<p class="text-muted-foreground text-sm">
				Date: {new Date(order.date).toLocaleDateString()} | State:
				<span class="font-semibold uppercase">{order.state}</span>
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
			{#if order.state === 'sale' && !order.projectId}
				<form
					action="?/createProject"
					method="POST"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								toast.success(m.toast_success_project_created());
							} else {
								toast.error(m.toast_error_failed_create_project());
							}
						};
					}}
				>
					<Button variant="default" type="submit" class="bg-indigo-600 hover:bg-indigo-700">
						<Rocket class="mr-2 h-4 w-4" />
						Create Project
					</Button>
				</form>
			{/if}

			{#if order.state === 'sale'}
				<form
					action="?/createInvoice"
					method="POST"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								toast.success(m.toast_success_invoice_created());
							} else {
								toast.error(m.toast_error_failed_create_invoice());
							}
						};
					}}
				>
					<Button variant="secondary" type="submit">
						<FileText class="mr-2 h-4 w-4" />
						Create Invoice
					</Button>
				</form>
			{/if}
		</div>
	</div>

	{#if order.projectId}
		<div
			class="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/50 p-4"
		>
			<div class="flex items-center gap-3">
				<div class="rounded-full bg-indigo-100 p-2 text-indigo-600">
					<CheckCircle2 class="h-5 w-5" />
				</div>
				<div>
					<p class="text-sm font-medium text-indigo-900">Project Linked</p>
					<p class="text-xs text-indigo-700">This order is now tracking as a live project.</p>
				</div>
			</div>
			<Button variant="outline" size="sm" href="/panel/project/{order.projectId}">
				View Project
			</Button>
		</div>
	{/if}

	<Separator />

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Customer Details</Card.Title>
			</Card.Header>
			<Card.Content>
				<p><strong>ID:</strong> {order.clientId}</p>
				<!-- We should fetch Client Name ideally, assuming order.client is loaded -->
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Order Summary</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex justify-between">
					<span>Subtotal:</span>
					<span>{order.subtotal}</span>
				</div>
				<div class="flex justify-between">
					<span>Tax:</span>
					<span>{order.taxTotal}</span>
				</div>
				<div class="flex justify-between font-bold">
					<span>Total:</span>
					<span>{order.total}</span>
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
					<th class="p-3">Quantity</th>
					<th class="p-3">Unit Price</th>
					<th class="p-3">Subtotal</th>
				</tr>
			</thead>
			<tbody>
				{#each order.lines as line (line.id)}
					<tr class="border-b last:border-0">
						<td class="p-3">{line.description}</td>
						<td class="p-3">{line.quantity}</td>
						<td class="p-3">{line.unitPrice}</td>
						<td class="p-3">{line.subtotal}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
