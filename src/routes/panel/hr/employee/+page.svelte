<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Button } from '$lib/components/ui/button';
	import Plus from '@lucide/svelte/icons/plus';
	import { Separator } from '$lib/components/ui/separator';
	// DataTable import - reusing existing generic component if possible
	// User page used: import DataTable from '$lib/components/ui/data-table/DataTable.svelte';
	// We need to define columns.

	// Placeholder for columns to avoid complex import for now, or use a simple table.
	// Let's use a simple Shadcn Table for this iteration to avoid dependency hell with DataTable columns definition files.

	import * as Table from '$lib/components/ui/table';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';

	let { data } = $props();
	let visibleNikIds = $state<Record<string, boolean>>({});

	function toggleNik(id: string) {
		visibleNikIds = { ...visibleNikIds, [id]: !visibleNikIds[id] };
	}
</script>

<svelte:head>
	<title>{m.employee_title()}</title>
	<meta name="description" content={m.employee_desc()} />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.employee_title()}
			</h2>
			<p class="text-muted-foreground">{m.employee_count_msg({ count: data.countAllEmployees })}</p>
		</div>
		<div class="flex items-center gap-2">
			<Button href={localizeHref('/panel/hr/employee/create')} size="sm" variant="outline"
				><Plus /> {m.btn_add_employee()}</Button
			>
		</div>
	</div>
	<Separator />

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>NIK</Table.Head>
					<Table.Head>Position</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head>Join Date</Table.Head>
					<Table.Head class="text-right">Action</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.allEmployees as employee (employee.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{employee.user?.name ?? '-'}</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<span
									class={visibleNikIds[employee.id]
										? ''
										: 'bg-muted-foreground/20 text-transparent blur-[4px] select-none'}
								>
									{employee.nik ?? 'XXXXXXXXXXXXXX'}
								</span>
								<Button
									variant="ghost"
									size="icon"
									class="h-6 w-6"
									onclick={() => toggleNik(employee.id)}
								>
									{#if visibleNikIds[employee.id]}
										<EyeOff class="h-3.5 w-3.5" />
									{:else}
										<Eye class="h-3.5 w-3.5" />
									{/if}
								</Button>
							</div>
						</Table.Cell>
						<Table.Cell>{employee.position?.name ?? '-'}</Table.Cell>
						<Table.Cell class="capitalize">{employee.status}</Table.Cell>
						<Table.Cell>{employee.user?.email ?? '-'}</Table.Cell>
						<Table.Cell
							>{employee.joinDate
								? new Date(employee.joinDate).toLocaleDateString()
								: '-'}</Table.Cell
						>
						<Table.Cell class="text-right">
							<Button
								variant="ghost"
								size="sm"
								href={localizeHref(`/panel/hr/employee/${employee.id}/edit`)}>Edit</Button
							>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={4} class="h-24 text-center">No employees found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
