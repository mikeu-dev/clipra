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
	<title>Journal Entries | ERP</title>
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-primary dark:text-primary text-2xl font-semibold tracking-tight">
				Journal Entries
			</h2>
			<p class="text-muted-foreground">Review general ledger entries.</p>
		</div>
		<div class="flex items-center gap-2">
			<Button href={localizeHref('/panel/accounting/journals/create')} size="sm" variant="outline"
				><Plus class="mr-2 h-4 w-4" /> Add Entry</Button
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
					<Table.Head>Journal</Table.Head>
					<Table.Head>Reference</Table.Head>
					<Table.Head>State</Table.Head>
					<Table.Head class="text-right">Action</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.entries as entry (entry.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{entry.number}</Table.Cell>
						<Table.Cell>{new Date(entry.date).toLocaleDateString()}</Table.Cell>
						<Table.Cell>{entry.journal?.name}</Table.Cell>
						<Table.Cell>{entry.reference || '-'}</Table.Cell>
						<Table.Cell>
							<Badge variant="outline" class="capitalize">{entry.state}</Badge>
						</Table.Cell>
						<Table.Cell class="text-right">
							<Button
								variant="ghost"
								size="sm"
								href={localizeHref(`/panel/accounting/journals/${entry.id}`)}>View</Button
							>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={6} class="h-24 text-center">No journal entries found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
