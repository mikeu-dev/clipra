<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Button } from '$lib/components/ui/button';
	import Plus from '@lucide/svelte/icons/plus';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	function getStatusVariant(state: string) {
		switch (state) {
			case 'draft':
				return 'secondary';
			case 'requested':
				return 'default';
			case 'approved':
				return 'default'; // Success green would be better but shadcn default badge is fine
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

<svelte:head>
	<title>{m.pr_title()} | ERP</title>
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.pr_title()}
			</h2>
			<p class="text-muted-foreground">{m.pr_desc()}</p>
		</div>
		<div class="flex items-center gap-2">
			<Button href={localizeHref('/panel/purchase/requisitions/create')} size="sm" variant="outline"
				><Plus class="mr-2 h-4 w-4" /> {m.btn_new_pr()}</Button
			>
		</div>
	</div>
	<Separator />

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">{m.tbl_number()}</Table.Head>
					<Table.Head>{m.tbl_date()}</Table.Head>
					<Table.Head>{m.tbl_project()}</Table.Head>
					<Table.Head>{m.tbl_requester()}</Table.Head>
					<Table.Head class="text-right">{m.tbl_total_est()}</Table.Head>
					<Table.Head>{m.tbl_status()}</Table.Head>
					<Table.Head class="text-right">{m.tbl_actions()}</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.requisitions as req (req.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{req.number}</Table.Cell>
						<Table.Cell>{new Date(req.date || new Date()).toLocaleDateString()}</Table.Cell>
						<Table.Cell>
							{#if req.project}
								<span class="font-medium text-blue-600">{req.project.name}</span>
							{:else}
								<span class="text-muted-foreground">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell>{req.requestedBy?.name || '-'}</Table.Cell>
						<Table.Cell class="text-right">{Number(req.totalAmount).toLocaleString()}</Table.Cell>
						<Table.Cell>
							<Badge variant={getStatusVariant(req.state || '')} class="capitalize">
								{req.state?.replace('_', ' ')}
							</Badge>
						</Table.Cell>
						<Table.Cell class="text-right">
							<Button
								variant="ghost"
								size="sm"
								href={localizeHref(`/panel/purchase/requisitions/${req.id}`)}
								>{m.action_view()}</Button
							>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={7} class="h-24 text-center">{m.pr_empty()}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
