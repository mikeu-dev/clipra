<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import Plus from '@lucide/svelte/icons/plus';
	import { format } from 'date-fns';

	let { data } = $props();
</script>

<div class="flex flex-col gap-4 p-4 md:p-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">Timesheets</h2>
			<p class="text-muted-foreground">Log and view your work hours.</p>
		</div>
		<Button href="/panel/hr/timesheets/create">
			<Plus class="mr-2 h-4 w-4" /> Log Time
		</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Date</Table.Head>
					<Table.Head>Project</Table.Head>
					<Table.Head>Task</Table.Head>
					<Table.Head>Hours</Table.Head>
					<Table.Head>Description</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.timesheets as log (log.id)}
					<Table.Row>
						<Table.Cell>{format(new Date(log.date), 'dd MMMM yyyy')}</Table.Cell>
						<Table.Cell>{log.project?.name || '-'}</Table.Cell>
						<Table.Cell>{log.task?.title || '-'}</Table.Cell>
						<Table.Cell>{log.hours}</Table.Cell>
						<Table.Cell class="max-w-[200px] truncate" title={log.description}
							>{log.description}</Table.Cell
						>
						<Table.Cell>
							<Badge
								variant={log.status === 'approved'
									? 'default'
									: log.status === 'rejected'
										? 'destructive'
										: 'secondary'}>{log.status}</Badge
							>
						</Table.Cell>
						<Table.Cell class="text-right">
							{#if log.status === 'draft' || log.status === 'rejected'}
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button {...props} variant="ghost" size="icon" class="h-8 w-8">
												<EllipsisVertical class="h-4 w-4" />
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item>Edit</DropdownMenu.Item>
										<DropdownMenu.Item>Submit</DropdownMenu.Item>
										<DropdownMenu.Item class="text-destructive">Delete</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							{/if}
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={7} class="h-24 text-center">No timesheets found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
