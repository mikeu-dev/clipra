<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Plus from '@lucide/svelte/icons/plus';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();

	let items = $state([{ description: '', quantity: 1, unitPrice: 0 }]);
	let isLoading = $state(false);

	function addItem() {
		items = [...items, { description: '', quantity: 1, unitPrice: 0 }];
	}

	function removeItem(index: number) {
		if (items.length > 1) {
			items = items.filter((_, i) => i !== index);
		}
	}

	let subtotal = $derived(items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0));
</script>

<div class="flex flex-col gap-4 p-4 md:p-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.btn_create_invoice()}
			</h2>
			<p class="text-muted-foreground">{m.invoice_create_desc()}</p>
		</div>
	</div>

	<form
		method="POST"
		action="?/createFullInvoice"
		use:enhance={() => {
			isLoading = true;
			return async ({ result }) => {
				isLoading = false;
				if (result.type === 'failure') {
					toast.error(m.msg_create_invoice_error());
				}
				// Redirect is handled by server
			};
		}}
		class="grid gap-6 md:grid-cols-2"
	>
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title>{m.label_invoice_details()}</Card.Title>
			</Card.Header>
			<Card.Content class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="number">{m.label_invoice_number()}</Label>
					<Input id="number" name="number" placeholder="INV-001" required />
				</div>
				<div class="space-y-2">
					<Label for="clientId">{m.tbl_client()}</Label>
					<select name="clientId" class="w-full rounded-md border p-2" required>
						<option value="">{m.placeholder_select_client()}</option>
						{#each data.clients as client (client.id)}
							<option value={client.id}>{client.name}</option>
						{/each}
					</select>
				</div>
				<div class="space-y-2">
					<Label for="projectId">{m.label_project_optional()}</Label>
					<select name="projectId" class="w-full rounded-md border p-2">
						<option value="">{m.placeholder_select_project()}</option>
						{#each data.projects as project (project.id)}
							<option value={project.id}>{project.name}</option>
						{/each}
					</select>
				</div>
				<div class="space-y-2">
					<Label for="issueDate">{m.tbl_issue_date()}</Label>
					<Input type="date" id="issueDate" name="issueDate" required />
				</div>
				<div class="space-y-2">
					<Label for="dueDate">{m.tbl_due_date()}</Label>
					<Input type="date" id="dueDate" name="dueDate" />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title>{m.label_items()}</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					<div class="grid grid-cols-12 gap-2 font-medium">
						<div class="col-span-6">{m.tbl_description()}</div>
						<div class="col-span-2">{m.tbl_qty()}</div>
						<div class="col-span-3">{m.tbl_price()}</div>
						<div class="col-span-1"></div>
					</div>
					{#each items as item, i (i)}
						<div class="grid grid-cols-12 gap-2">
							<div class="col-span-6">
								<Input
									name="itemDescription"
									bind:value={item.description}
									required
									placeholder={m.placeholder_item_desc()}
								/>
							</div>
							<div class="col-span-2">
								<Input
									type="number"
									name="itemQuantity"
									bind:value={item.quantity}
									min="1"
									required
								/>
							</div>
							<div class="col-span-3">
								<Input
									type="number"
									name="itemPrice"
									bind:value={item.unitPrice}
									min="0"
									required
								/>
							</div>
							<div class="col-span-1 text-center">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onclick={() => removeItem(i)}
									disabled={items.length === 1}
								>
									<Trash2 class="text-destructive h-4 w-4" />
								</Button>
							</div>
						</div>
					{/each}
					<Button type="button" variant="outline" size="sm" onclick={addItem}>
						<Plus class="mr-2 h-4 w-4" />
						{m.btn_add_item()}
					</Button>
				</div>

				<div class="mt-8 flex justify-end">
					<div class="w-1/3 space-y-2">
						<div class="flex justify-between text-lg font-bold">
							<span>{m.tbl_total()}</span>
							<span
								>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
									subtotal
								)}</span
							>
						</div>
					</div>
				</div>

				<div class="mt-4">
					<Label for="notes">{m.label_notes()}</Label>
					<Textarea name="notes" placeholder={m.placeholder_notes()} />
				</div>
			</Card.Content>
		</Card.Root>

		<div class="flex justify-end md:col-span-2">
			<Button type="submit" disabled={isLoading}>
				{#if isLoading}
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> {m.btn_creating()}
				{:else}
					{m.btn_create_invoice()}
				{/if}
			</Button>
		</div>
	</form>
</div>
