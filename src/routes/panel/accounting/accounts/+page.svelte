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
	<title>Chart of Accounts | ERP</title>
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				Chart of Accounts
			</h2>
			<p class="text-muted-foreground">Manage your general ledger accounts.</p>
		</div>
		<div class="flex items-center gap-2">
			<Button href={localizeHref('/panel/accounting/accounts/create')} size="sm" variant="outline"
				><Plus class="mr-2 h-4 w-4" /> Add Account</Button
			>
		</div>
	</div>
	<Separator />

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">Code</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Type</Table.Head>
					<Table.Head>Reconcile</Table.Head>
					<Table.Head class="text-right">Balance</Table.Head>
					<Table.Head class="text-right">Action</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.accounts as account (account.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{account.code}</Table.Cell>
						<Table.Cell>{account.name}</Table.Cell>
						<Table.Cell>
							<Badge variant="outline" class="capitalize">{account.type.replace('_', ' ')}</Badge>
						</Table.Cell>
						<Table.Cell>{account.reconcile ? 'Yes' : 'No'}</Table.Cell>
						<Table.Cell class="text-right">-</Table.Cell>
						<Table.Cell class="text-right">
							<Button
								variant="ghost"
								size="sm"
								href={localizeHref(`/panel/accounting/accounts/${account.id}/edit`)}>Edit</Button
							>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={6} class="h-24 text-center">No accounts found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
