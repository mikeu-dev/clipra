<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import Plus from '@lucide/svelte/icons/plus';
	import Eye from '@lucide/svelte/icons/eye';
	import DollarSign from '@lucide/svelte/icons/dollar-sign';

	import type { ActionResult } from '@sveltejs/kit';
	let { data } = $props();
	let isGenerating = $state(false);

	function handleResult({ result }: { result: ActionResult }) {
		if (result.type === 'success') {
			toast.success(m.toast_success_payroll_batch_processed());
			isGenerating = false;
		} else if (result.type === 'failure') {
			toast.error(result.data?.error || 'Operation failed');
		}
	}

	function formatDate(date: string | Date | null) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('id-ID', {
			month: 'long',
			year: 'numeric'
		});
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'paid':
				return 'default';
			case 'processed':
				return 'secondary';
			case 'cancelled':
				return 'destructive';
			default:
				return 'outline';
		}
	}
</script>

<div class="flex flex-col gap-4 p-4">
	<div class="flex items-center justify-between">
		<div>
			<h1
				class="flex items-center gap-2 text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100"
			>
				<DollarSign class="h-6 w-6" />
				Payroll Management
			</h1>
			<p class="text-muted-foreground">Generate and manage employee payroll batches.</p>
		</div>
		<Button onclick={() => (isGenerating = true)}>
			<Plus class="mr-2 h-4 w-4" />
			Generate Payroll
		</Button>
	</div>

	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Period</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Created</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.batches as batch (batch.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{batch.name}</Table.Cell>
							<Table.Cell>{formatDate(batch.period)}</Table.Cell>
							<Table.Cell>
								<Badge variant={getStatusColor(batch.status || 'draft')}>{batch.status}</Badge>
							</Table.Cell>
							<Table.Cell>{formatDate(batch.createdAt)}</Table.Cell>
							<Table.Cell class="text-right">
								<Button
									variant="ghost"
									size="sm"
									onclick={() => goto(`/panel/finance/payroll/${batch.id}`)}
								>
									<Eye class="mr-2 h-4 w-4" />
									View Details
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
					{#if data.batches.length === 0}
						<Table.Row>
							<Table.Cell colspan={5} class="text-muted-foreground py-8 text-center">
								No payroll batches found. Generate your first payroll.
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<!-- Generate Payroll Dialog -->
	<Dialog.Root bind:open={isGenerating}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Generate Payroll Batch</Dialog.Title>
				<Dialog.Description>
					Create a new payroll batch for all active employees.
				</Dialog.Description>
			</Dialog.Header>
			<form method="POST" action="?/generate" use:enhance={() => handleResult} class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Batch Name</Label>
					<Input id="name" name="name" required placeholder="e.g., Gaji Januari 2024" />
				</div>
				<div class="space-y-2">
					<Label for="period">Period (Month)</Label>
					<Input id="period" name="period" type="month" required />
				</div>
				<div class="flex justify-end gap-2 pt-4">
					<Button variant="outline" type="button" onclick={() => (isGenerating = false)}>
						Cancel
					</Button>
					<Button type="submit">Generate</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
