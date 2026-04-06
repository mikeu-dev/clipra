<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import Plus from '@lucide/svelte/icons/plus';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();
</script>

<div class="flex flex-col gap-4 p-4 md:p-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.expense_title()}
			</h2>
			<p class="text-muted-foreground">{m.expense_desc()}</p>
		</div>
		<Button href="/panel/finance/expenses/create">
			<Plus class="mr-2 h-4 w-4" />
			{m.btn_record_expense()}
		</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>{m.tbl_date()}</Table.Head>
					<Table.Head>{m.tbl_category()}</Table.Head>
					<Table.Head>{m.tbl_description()}</Table.Head>
					<Table.Head>{m.tbl_project()}</Table.Head>
					<Table.Head>{m.tbl_user()}</Table.Head>
					<Table.Head>{m.tbl_amount()}</Table.Head>
					<Table.Head>{m.tbl_status()}</Table.Head>
					<Table.Head class="text-right">{m.tbl_actions()}</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.expenses as expense (expense.id)}
					<Table.Row>
						<Table.Cell>{new Date(expense.date).toLocaleDateString()}</Table.Cell>
						<Table.Cell>{expense.category || '-'}</Table.Cell>
						<Table.Cell class="max-w-[200px] truncate" title={expense.description}
							>{expense.description}</Table.Cell
						>
						<Table.Cell>{expense.project?.name || '-'}</Table.Cell>
						<Table.Cell>{expense.user?.name || '-'}</Table.Cell>
						<Table.Cell
							>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
								Number(expense.amount)
							)}</Table.Cell
						>
						<Table.Cell>
							<Badge
								variant={expense.status === 'approved'
									? 'default'
									: expense.status === 'rejected'
										? 'destructive'
										: 'secondary'}>{expense.status}</Badge
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
									<DropdownMenu.Item>{m.action_edit()}</DropdownMenu.Item>
									<DropdownMenu.Item class="text-destructive">{m.action_delete()}</DropdownMenu.Item
									>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={8} class="h-24 text-center">{m.msg_no_expenses()}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
