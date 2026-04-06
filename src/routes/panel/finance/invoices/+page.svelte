<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import Plus from '@lucide/svelte/icons/plus';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();
</script>

<div class="flex flex-col gap-4 p-4 md:p-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.invoice_title()}
			</h2>
			<p class="text-muted-foreground">{m.invoice_desc()}</p>
		</div>
		<Button href="/panel/finance/invoices/create">
			<Plus class="mr-2 h-4 w-4" />
			{m.btn_create_invoice()}
		</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>{m.tbl_number()}</Table.Head>
					<Table.Head>{m.tbl_client()}</Table.Head>
					<Table.Head>{m.tbl_issue_date()}</Table.Head>
					<Table.Head>{m.tbl_due_date()}</Table.Head>
					<Table.Head>{m.tbl_amount()}</Table.Head>
					<Table.Head>{m.tbl_status()}</Table.Head>
					<Table.Head class="text-right">{m.tbl_actions()}</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.invoices as invoice (invoice.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{invoice.number}</Table.Cell>
						<Table.Cell>{invoice.client?.name || '-'}</Table.Cell>
						<Table.Cell>{new Date(invoice.issueDate).toLocaleDateString()}</Table.Cell>
						<Table.Cell
							>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</Table.Cell
						>
						<Table.Cell
							>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
								Number(invoice.total)
							)}</Table.Cell
						>
						<Table.Cell>
							<Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}
								>{invoice.status}</Badge
							>
						</Table.Cell>
						<Table.Cell class="text-right">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Button {...props} variant="ghost" size="icon" class="h-8 w-8">
											<EllipsisVertical class="h-4 w-4" />
										</Button>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end">
									<DropdownMenu.Item onclick={() => goto(`/panel/finance/invoices/${invoice.id}`)}
										>{m.action_view_details()}</DropdownMenu.Item
									>
									<DropdownMenu.Item>{m.action_download_pdf()}</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={7} class="h-24 text-center">{m.msg_no_invoices()}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
