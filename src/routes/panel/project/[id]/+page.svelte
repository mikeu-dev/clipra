<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	import { Badge } from '$lib/components/ui/badge';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import Plus from '@lucide/svelte/icons/plus';
	import Clock from '@lucide/svelte/icons/clock';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Settings from '@lucide/svelte/icons/settings';
	import Filter from '@lucide/svelte/icons/filter';
	import DollarSign from '@lucide/svelte/icons/dollar-sign';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import Activity from '@lucide/svelte/icons/activity';
	import FileText from '@lucide/svelte/icons/file-text';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { onMount, untrack } from 'svelte';
	import type { PageData } from './$types';
	import type { Task } from '$lib/server/database/schemas';

	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { taskSchema } from '$lib/schemas/task';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { deserialize } from '$app/forms';
	import * as m from '$lib/paraglide/messages.js';
	import {
		msg_task_updated,
		msg_task_created,
		msg_operation_failed
	} from '$lib/paraglide/messages.js';

	let { data }: { data: PageData } = $props();
	let project = $derived(data.project);

	// Reactive board tasks
	// eslint-disable-next-line svelte/prefer-writable-derived
	let boardTasks = $state(untrack(() => data.project.tasks));

	// Keep boardTasks in sync with server data
	$effect(() => {
		boardTasks = data.project.tasks;
	});

	// Filters & Swimlanes state
	let filterAssignee = $state('');
	let filterPriority = $state('');
	let activeSwimlane = $state('none'); // 'none' or 'assignee'

	// Column configuration map for easy lookup
	let columnConfigMap = $derived(
		data.columns.reduce((acc: Record<string, { label: string; color: string }>, col) => {
			acc[col.id] = { label: col.name, color: col.color || '#6B7280' };
			return acc;
		}, {})
	);

	// Real-time Update
	onMount(() => {
		const eventSource = new EventSource('/api/notifications');

		eventSource.onmessage = (event) => {
			try {
				JSON.parse(event.data);
				// console.log('SSE Data:', data); // Debug
			} catch {
				// ignore
			}
		};

		eventSource.addEventListener('task_updated', (event) => {
			try {
				const { projectId, task } = JSON.parse(event.data);
				if (projectId === project.id) {
					invalidateAll(); // Simplest way: reload data
					toast.info(`${msg_task_updated()}: "${task.title}"`);
				}
			} catch (e) {
				console.error(e);
			}
		});

		return () => {
			eventSource.close();
		};
	});

	// DND Handlers
	function handleDndConsider(sid: string, cid: string, e: CustomEvent<DndEvent<Task>>) {
		const { items } = e.detail;
		// Update boardTasks optimistically during drag
		// We replace the items for this specific swimlane and column
		updateBoardTasks(sid, cid, items);
	}

	async function handleDndFinalize(sid: string, cid: string, e: CustomEvent<DndEvent<Task>>) {
		const { items: newItems } = e.detail;

		// updateBoardTasks ensures local state is correct
		updateBoardTasks(sid, cid, newItems);

		// Find the item that moved column (if any)
		const movedItem = newItems.find((item: Task) => item.columnId !== cid);

		if (movedItem) {
			movedItem.columnId = cid; // Optimistic change

			// If swimlane is assignee, update assignedTo too
			if (activeSwimlane === 'assignee') {
				if (sid === 'unassigned') {
					movedItem.assignedTo = null;
				} else {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const user = project.projectUsers.find((pu: any) => pu.user.id === sid)?.user;
					movedItem.assignedTo = user || null;
				}
			}

			const formData = new FormData();
			formData.append('taskId', movedItem.id);
			formData.append('columnId', cid);

			try {
				await fetch('?/updateTaskColumn', { method: 'POST', body: formData });
			} catch {
				toast.error('Network error');
				invalidateAll();
				return;
			}
		}

		// Sync order
		const reorderData = new FormData();
		reorderData.append('columnId', cid);
		reorderData.append('taskIds', JSON.stringify(newItems.map((i: Task) => i.id)));

		try {
			const response = await fetch('?/reorderTasks', { method: 'POST', body: reorderData });
			const result = deserialize(await response.text());
			if (result.type === 'failure') {
				toast.error(msg_operation_failed());
				invalidateAll();
			}
		} catch {
			toast.error('Network error during reorder');
			invalidateAll();
		}
	}

	function updateBoardTasks(sid: string, cid: string, newItems: Task[]) {
		// Ensure items being added to this (Swimlane, Column) have the correct properties
		const modifiedItems = newItems.map((item) => {
			const updated = { ...item, columnId: cid };

			// If swimlane is assignee, also sync assignedTo
			if (activeSwimlane === 'assignee') {
				if (sid === 'unassigned') {
					updated.assignedTo = null;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const user = project.projectUsers.find((pu: any) => pu.user.id === sid)?.user;
					if (user) updated.assignedTo = user;
				}
			}
			return updated;
		});

		// Replace old items in this swimlane/column with modifiedItems
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const otherTasks = boardTasks.filter((t: any) => {
			if (t.parentId) return true; // keep subtasks as is

			const inThisColumn = t.columnId === cid;
			let inThisSwimlane = false;
			if (activeSwimlane === 'none') inThisSwimlane = true;
			else if (activeSwimlane === 'assignee') {
				if (sid === 'unassigned') inThisSwimlane = !t.assignedTo;
				else inThisSwimlane = t.assignedTo?.id === sid;
			}

			// Keep tasks that are NOT in this specific swimlane+column
			return !(inThisColumn && inThisSwimlane);
		});

		// Add updated items
		boardTasks = [...otherTasks, ...modifiedItems];
	}

	let isTaskEditMode = $state(false);
	let taskToDelete = $state('');
	let isTaskDeleteDialogOpen = $state(false);

	// Task Form
	const taskForm = superForm(
		untrack(() => data.taskForm),
		{
			validators: zodClient(taskSchema),
			id: 'taskForm',
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(isTaskEditMode ? msg_task_updated() : msg_task_created());
					isTaskOpen = false;
					invalidateAll();
				} else if (result.type === 'error') {
					toast.error(result.error?.message || msg_operation_failed());
				}
			}
		}
	);

	const { form: formData, enhance, delayed } = taskForm;
	let isTaskOpen = $state(false);

	// Initial project ID assignment
	$effect(() => {
		$formData.projectId = project.id;
	});

	function getInitials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.substring(0, 2)
			.toUpperCase();
	}

	// Swimlanes helpers
	const swimlanes = [
		{ id: 'none', label: m.label_no_swimlanes() },
		{ id: 'assignee', label: m.label_assignees() }
	];

	let swimlaneGroups = $derived.by(() => {
		const filtered = boardTasks.filter((t: (typeof boardTasks)[0]) => {
			const matchesAssignee = !filterAssignee || t.assignedTo?.id === filterAssignee;
			const matchesPriority = !filterPriority || t.priority === filterPriority;
			return matchesAssignee && matchesPriority;
		});

		if (activeSwimlane === 'none') return [{ id: 'all', label: 'All Tasks', items: filtered }];

		if (activeSwimlane === 'assignee') {
			const groups = project.projectUsers.map((pu: (typeof project.projectUsers)[0]) => ({
				id: pu.user.id,
				label: pu.user.name,
				items: filtered.filter((t: (typeof boardTasks)[0]) => t.assignedTo?.id === pu.user.id)
			}));

			// Unassigned group
			groups.push({
				id: 'unassigned',
				label: m.label_unassigned(),
				items: filtered.filter((t: (typeof boardTasks)[0]) => !t.assignedTo)
			});

			return groups;
		}

		return [];
	});

	function formatDate(date: string | null) {
		if (!date) return '';
		return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
	}

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'high':
				return 'destructive';
			case 'medium':
				return 'default';
			case 'low':
				return 'secondary';
			default:
				return 'outline';
		}
	}

	function formatCurrency(value: number | string | null) {
		if (value === null || value === undefined) return 'Rp 0';
		const num = typeof value === 'string' ? parseFloat(value) : value;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(num);
	}

	function openTaskCreate() {
		isTaskEditMode = false;
		taskForm.reset();
		$formData.projectId = project.id;
		$formData.columnId = data.columns[0]?.id || '';
		isTaskOpen = true;
	}

	function openTaskEdit(task: (typeof data.project.tasks)[number]) {
		isTaskEditMode = true;
		taskForm.reset();
		$formData.id = task.id;
		$formData.projectId = task.projectId;
		$formData.parentId = task.parentId || '';
		$formData.title = task.title;
		$formData.description = task.description || '';
		$formData.columnId = task.columnId;
		$formData.priority = task.priority;
		$formData.deadline = task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '';
		$formData.assignedTo = task.assignedTo ? task.assignedTo.id : '';
		isTaskOpen = true;
	}

	function confirmTaskDelete(id: string) {
		taskToDelete = id;
		isTaskDeleteDialogOpen = true;
	}

	// Column Management
	let isManageColumnsOpen = $state(false);

	function openManageColumns() {
		isManageColumnsOpen = true;
	}

	// Subtasks logic
	function openSubtaskCreate(parentId: string) {
		isTaskEditMode = false;
		taskForm.reset();
		$formData.projectId = project.id;
		$formData.parentId = parentId;
		$formData.columnId = data.columns[0]?.id || '';
		isTaskOpen = true;
	}
</script>

<svelte:head>
	<title>{m.title_project_board({ name: project.name })}</title>
</svelte:head>

<div class="flex h-full flex-col overflow-hidden p-4 md:px-8 md:pb-8">
	<div class="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{project.name}
			</h2>
			<div class="text-muted-foreground flex items-center gap-2 text-sm">
				<span>{project.client?.name}</span>
				<span>&bull;</span>
				<Badge variant="outline" class="h-5 px-1.5 text-[10px] uppercase">{project.status}</Badge>
				{#if project.salesOrders?.length > 0}
					<span class="flex items-center gap-1">
						&bull;
						<FileText class="h-3 w-3" />
						Origin:
						<a
							href="/panel/crm/orders/{project.salesOrders[0].id}"
							class="text-indigo-600 hover:underline"
						>
							{project.salesOrders[0].number}
						</a>
					</span>
				{/if}
			</div>
		</div>
		<div class="flex items-center gap-2">
			<div class="mr-4 flex -space-x-2">
				{#each project.projectUsers.slice(0, 5) as pu (pu.user.id)}
					<Avatar.Root class="border-background h-8 w-8 cursor-help border-2" title={pu.user.name}>
						<Avatar.Fallback>{getInitials(pu.user.name)}</Avatar.Fallback>
					</Avatar.Root>
				{/each}
			</div>
			<Button variant="outline" size="sm" onclick={openManageColumns}>
				<Settings class="mr-2 h-4 w-4" />
				{m.btn_manage_columns()}
			</Button>
			<Button size="sm" onclick={openTaskCreate}
				><Plus class="mr-2 h-4 w-4" /> {m.btn_add_task()}</Button
			>
		</div>
	</div>

	<!-- Project Stats -->
	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-muted-foreground text-xs font-medium tracking-wider uppercase"
					>Total Budget</Card.Title
				>
				<DollarSign class="text-muted-foreground h-4 w-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-xl font-bold">{formatCurrency(project.totalBudget)}</div>
				<p class="text-muted-foreground text-xs">Anggaran yang dialokasikan</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-muted-foreground text-xs font-medium tracking-wider uppercase"
					>Actual Cost</Card.Title
				>
				<TrendingUp
					class="h-4 w-4 {parseFloat(project.stats?.totalActualCost) >
					parseFloat(project.totalBudget)
						? 'text-destructive'
						: 'text-green-500'}"
				/>
			</Card.Header>
			<Card.Content>
				<div class="text-xl font-bold">{formatCurrency(project.stats?.totalActualCost)}</div>
				<div class="bg-muted mt-2 rounded-md p-2 text-[10px]">
					<div class="flex justify-between">
						<span>Labor (Timesheets):</span>
						<span
							>{formatCurrency(
								project.stats?.totalActualCost - project.stats?.totalProcurementCost
							)}</span
						>
					</div>
					<div class="flex justify-between">
						<span>Material (Procurement):</span>
						<span>{formatCurrency(project.stats?.totalProcurementCost)}</span>
					</div>
				</div>
				{#if parseFloat(project.totalBudget) > 0}
					{@const percent =
						(parseFloat(project.stats?.totalActualCost) / parseFloat(project.totalBudget)) * 100}
					<p class="mt-2 text-xs {percent > 100 ? 'text-destructive' : 'text-muted-foreground'}">
						{percent.toFixed(1)}% dari budget
					</p>
				{:else}
					<p class="text-muted-foreground mt-2 text-xs">Belum ada budget</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-muted-foreground text-xs font-medium tracking-wider uppercase"
					>Estimated Hours</Card.Title
				>
				<Activity class="text-muted-foreground h-4 w-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-xl font-bold">{project.estimatedHours || 0} h</div>
				<p class="text-muted-foreground text-xs">Estimasi waktu pengerjaan</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-muted-foreground text-xs font-medium tracking-wider uppercase"
					>Actual Hours</Card.Title
				>
				<Clock class="text-muted-foreground h-4 w-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-xl font-bold">{(project.stats?.totalActualHours || 0).toFixed(1)} h</div>
				{#if project.estimatedHours > 0}
					{@const percent = (project.stats?.totalActualHours / project.estimatedHours) * 100}
					<p class="text-xs {percent > 100 ? 'text-warning' : 'text-muted-foreground'}">
						{percent.toFixed(1)}% dari estimasi
					</p>
				{:else}
					<p class="text-muted-foreground text-xs">Tanpa estimasi</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-muted-foreground text-xs font-medium tracking-wider uppercase"
					>Total Revenue</Card.Title
				>
				<TrendingUp class="h-4 w-4 text-green-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-xl font-bold text-green-600">
					{formatCurrency(project.stats?.totalRevenue)}
				</div>
				<p class="text-muted-foreground text-xs">Total tagihan (Invoices)</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-muted-foreground text-xs font-medium tracking-wider uppercase"
					>Project Profit</Card.Title
				>
				<Activity
					class="{project.stats?.totalProfit >= 0 ? 'text-green-500' : 'text-destructive'} h-4 w-4"
				/>
			</Card.Header>
			<Card.Content>
				<div
					class="text-xl font-bold {project.stats?.totalProfit >= 0
						? 'text-green-600'
						: 'text-destructive'}"
				>
					{formatCurrency(project.stats?.totalProfit)}
				</div>
				{#if project.stats?.totalRevenue > 0}
					{@const margin = (project.stats?.totalProfit / project.stats?.totalRevenue) * 100}
					<p class="text-xs {margin < 20 ? 'text-warning' : 'text-muted-foreground'}">
						Margin: {margin.toFixed(1)}%
					</p>
				{:else}
					<p class="text-muted-foreground text-xs">N/A Margin</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<div class="mb-6 flex flex-wrap items-center gap-3">
		<div class="flex items-center gap-2">
			<Filter class="text-muted-foreground h-4 w-4" />
			<Select.Root type="single" bind:value={filterAssignee}>
				<Select.Trigger class="h-8 w-[150px] text-xs">
					{filterAssignee
						? // eslint-disable-next-line @typescript-eslint/no-explicit-any
							project.projectUsers.find((pu: any) => pu.user.id === filterAssignee)?.user.name
						: 'All Assignees'}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="" label={m.label_all_assignees()}
						>{m.label_all_assignees()}</Select.Item
					>
					{#each project.projectUsers as pu (pu.user.id)}
						<Select.Item value={pu.user.id} label={pu.user.name}>{pu.user.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<Select.Root type="single" bind:value={filterPriority}>
			<Select.Trigger class="h-8 w-[120px] text-xs">
				{filterPriority
					? filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1)
					: 'All Priorities'}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="" label={m.label_all_priorities()}
					>{m.label_all_priorities()}</Select.Item
				>
				<Select.Item value="low" label={m.priority_low()}>{m.priority_low()}</Select.Item>
				<Select.Item value="medium" label={m.priority_medium()}>{m.priority_medium()}</Select.Item>
				<Select.Item value="high" label={m.priority_high()}>{m.priority_high()}</Select.Item>
			</Select.Content>
		</Select.Root>

		<div class="bg-border mx-2 h-4 w-px"></div>

		<div class="flex items-center gap-2 text-xs font-medium">
			<span>{m.label_group_by()}:</span>
			<div class="bg-muted/50 flex rounded-md border p-0.5">
				{#each swimlanes as s (s.id)}
					<button
						class="rounded-sm px-2 py-1 transition-colors {activeSwimlane === s.id
							? 'bg-background border shadow-sm'
							: 'text-muted-foreground hover:text-foreground'}"
						onclick={() => (activeSwimlane = s.id)}
					>
						{s.label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Procurement Section (New) -->
	{#if project.purchaseOrders?.length > 0 || project.purchaseRequisitions?.length > 0}
		<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-lg">Purchase Orders</Card.Title>
					<Card.Description>Goods & services purchased for this project.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="space-y-3">
						{#each project.purchaseOrders as po (po.id)}
							<div class="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
								<div>
									<p class="text-sm font-medium">{po.number}</p>
									<p class="text-muted-foreground text-xs">{po.supplier?.name}</p>
								</div>
								<div class="text-right">
									<p class="text-sm font-bold">{formatCurrency(po.total)}</p>
									<Badge variant="outline" class="h-4 text-[10px] uppercase">{po.state}</Badge>
								</div>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title class="text-lg">Pending Requisitions</Card.Title>
					<Card.Description>Requested items awaiting approval or ordering.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="space-y-3">
						{#each project.purchaseRequisitions.filter((r: (typeof project.purchaseRequisitions)[0]) => r.state !== 'ordered' && r.state !== 'cancelled') as req (req.id)}
							<div class="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
								<div>
									<p class="text-sm font-medium">{req.number}</p>
									<p class="text-muted-foreground text-xs">{req.description}</p>
								</div>
								<div class="text-right">
									<p class="text-sm font-bold">{formatCurrency(req.totalAmount)}</p>
									<Badge variant="outline" class="h-4 text-[10px] uppercase">{req.state}</Badge>
								</div>
							</div>
						{:else}
							<p class="text-center text-muted-foreground text-sm py-4">No pending requisitions.</p>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<!-- Invoices Section (New) -->
	{#if project.invoices?.length > 0}
		<div class="mb-8">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-lg">Project Invoices</Card.Title>
					<Card.Description>Billing history for this project.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="overflow-hidden rounded-md border text-sm">
						<table class="w-full">
							<thead class="bg-muted/50 border-b">
								<tr>
									<th class="p-2 text-left">Invoice #</th>
									<th class="p-2 text-left">Date</th>
									<th class="p-2 text-right">Amount</th>
									<th class="p-2">Status</th>
									<th class="p-2 text-right">Action</th>
								</tr>
							</thead>
							<tbody>
								{#each project.invoices as inv (inv.id)}
									<tr class="border-b last:border-0">
										<td class="p-2 font-medium">{inv.number}</td>
										<td class="p-2 text-xs">{new Date(inv.issueDate).toLocaleDateString()}</td>
										<td class="p-2 text-right font-bold">{formatCurrency(inv.total)}</td>
										<td class="p-2 text-center">
											<Badge variant="outline" class="h-4 text-[10px] uppercase">{inv.status}</Badge
											>
										</td>
										<td class="p-2 text-right">
											<Button
												variant="ghost"
												size="sm"
												href={localizeHref(`/panel/finance/invoices/${inv.id}`)}>View</Button
											>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<!-- Kanban Board with Swimlanes -->
	<div class="min-h-0 flex-1 overflow-y-auto">
		<div class="flex flex-col gap-8 pb-8">
			{#each swimlaneGroups as swimlane (swimlane.id)}
				<div class="space-y-3">
					{#if activeSwimlane !== 'none'}
						<div class="flex items-center gap-2 px-1">
							<Badge variant="secondary" class="font-bold">{swimlane.label}</Badge>
							<div class="bg-border/50 h-px flex-1"></div>
						</div>
					{/if}

					<div class="flex min-h-[300px] gap-4 overflow-x-auto pb-4">
						{#each data.columns as column (column.id)}
							{@const columnTasks = swimlane.items.filter(
								(t: Task) => t.columnId === column.id && !t.parentId
							)}
							<div
								class="bg-muted/40 flex w-full max-w-[400px] min-w-[300px] flex-col rounded-lg border p-4"
							>
								<div class="mb-4 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<div
											class="h-2 w-2 rounded-full"
											style="background-color: {column.color}"
										></div>
										<h3 class="text-sm font-semibold tracking-wide uppercase">
											{column.name}
										</h3>
									</div>
									<div class="flex items-center gap-2">
										{#if column.wipLimit}
											<Badge
												variant={columnTasks.length > column.wipLimit ? 'destructive' : 'outline'}
												class="text-[10px]"
											>
												{columnTasks.length} / {column.wipLimit}
											</Badge>
										{:else}
											<Badge variant="outline">{columnTasks.length}</Badge>
										{/if}
									</div>
								</div>

								<div
									class="flex min-h-[100px] flex-1 flex-col gap-3 overflow-y-auto pr-2"
									use:dndzone={{
										items: columnTasks,
										flipDurationMs: 300,
										dropTargetStyle: { outline: '2px solid var(--primary)' }
									}}
									onconsider={(e) =>
										handleDndConsider(swimlane.id, column.id, e as CustomEvent<DndEvent<Task>>)}
									onfinalize={(e) =>
										handleDndFinalize(swimlane.id, column.id, e as CustomEvent<DndEvent<Task>>)}
								>
									{#each columnTasks as task (task.id)}
										<div animate:flip={{ duration: 300 }}>
											<Card.Root class="hover:border-primary/50 group relative block">
												<Card.Header class="p-3 pb-0">
													<div class="flex items-start justify-between gap-2">
														<Card.Title class="text-sm leading-tight font-medium"
															>{task.title}</Card.Title
														>
														<div class="flex items-center">
															<Button
																variant="ghost"
																size="icon"
																class="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
																onclick={() => openSubtaskCreate(task.id)}
																title={m.label_add_subtask()}
															>
																<Plus class="h-3 w-3" />
															</Button>
															<DropdownMenu.Root>
																<DropdownMenu.Trigger>
																	{#snippet child({ props })}
																		<Button
																			{...props}
																			variant="ghost"
																			size="icon"
																			class="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
																		>
																			<EllipsisVertical class="h-3 w-3" />
																		</Button>
																	{/snippet}
																</DropdownMenu.Trigger>
																<DropdownMenu.Content align="end">
																	<DropdownMenu.Item onclick={() => openTaskEdit(task)}>
																		<Pencil class="mr-2 h-4 w-4" />
																		{m.action_edit()}
																	</DropdownMenu.Item>
																	<DropdownMenu.Item
																		class="text-destructive focus:text-destructive"
																		onclick={() => confirmTaskDelete(task.id)}
																	>
																		<Trash2 class="mr-2 h-4 w-4" />
																		{m.action_delete()}
																	</DropdownMenu.Item>
																</DropdownMenu.Content>
															</DropdownMenu.Root>
														</div>
													</div>
												</Card.Header>
												<Card.Content class="p-3">
													<div class="mb-2 flex flex-wrap items-center gap-2">
														<Badge
															variant={getPriorityColor(task.priority)}
															class="h-5 px-1 text-[10px]">{task.priority}</Badge
														>
														{#if task.subtasks && task.subtasks.length > 0}
															{@const totalSub = task.subtasks.length}
															{@const doneSub = task.subtasks.filter((st: Task) => {
																const col = data.columns.find((c) => c.id === st.columnId);
																return col && col.name.toLowerCase().includes('done');
															}).length}

															<div class="mt-2 space-y-1">
																<div class="mb-1 flex items-center justify-between">
																	<span class="text-muted-foreground text-[10px] font-semibold"
																		>{m.label_progress()}</span
																	>
																	<span
																		class="text-[10px] font-bold {doneSub === totalSub
																			? 'text-green-600'
																			: ''}"
																	>
																		{doneSub} / {totalSub}
																	</span>
																</div>
																<div class="bg-muted mb-2 h-1 w-full overflow-hidden rounded-full">
																	<div
																		class="bg-primary h-full transition-all duration-500"
																		style="width: {(doneSub / totalSub) * 100}%"
																	></div>
																</div>

																{#each task.subtasks as subtask (subtask.id)}
																	{@const isDone = data.columns
																		.find((c) => c.id === subtask.columnId)
																		?.name.toLowerCase()
																		.includes('done')}
																	<div
																		class="bg-muted/50 flex items-center gap-2 rounded px-2 py-1 text-[10px]"
																	>
																		<div
																			class="h-1.5 w-1.5 rounded-full {isDone
																				? 'bg-green-500'
																				: 'bg-primary/40'}"
																		></div>
																		<span
																			class="truncate {isDone
																				? 'text-muted-foreground line-through'
																				: ''}">{subtask.title}</span
																		>
																	</div>
																{/each}
															</div>
														{/if}
													</div>
													{#if task.deadline}
														<div class="text-muted-foreground mb-2 flex items-center gap-1 text-xs">
															<Clock class="h-3 w-3" />
															<span>{formatDate(task.deadline)}</span>
														</div>
													{/if}
													<div class="flex items-center justify-between">
														{#if task.assignee}
															<Avatar.Root class="h-6 w-6">
																<Avatar.Fallback class="text-[10px]"
																	>{getInitials(task.assignee.name)}</Avatar.Fallback
																>
															</Avatar.Root>
														{:else}
															<div
																class="bg-muted flex h-6 w-6 items-center justify-center rounded-full border border-dashed"
															>
																<span class="text-muted-foreground text-[10px]">?</span>
															</div>
														{/if}
														<span class="text-muted-foreground text-[10px]"
															>{task.id.substring(0, 4)}</span
														>
													</div>
												</Card.Content>
											</Card.Root>
										</div>
									{/each}
									{#if columnTasks.length === 0}
										<div
											class="text-muted-foreground pointer-events-none flex h-24 flex-col items-center justify-center rounded-md border border-dashed p-4"
										>
											<span class="text-[10px]">{m.label_drop_here()}</span>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<Dialog.Root bind:open={isTaskOpen}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>{isTaskEditMode ? m.dialog_edit_task() : m.dialog_add_task()}</Dialog.Title>
			<Dialog.Description
				>{isTaskEditMode ? m.dialog_edit_task_desc() : m.dialog_add_task_desc()}</Dialog.Description
			>
		</Dialog.Header>
		<form
			method="POST"
			action={isTaskEditMode ? '?/updateTask' : '?/createTask'}
			use:enhance
			class="grid gap-4 py-4"
		>
			<input type="hidden" name="projectId" value={project.id} />
			{#if isTaskEditMode}
				<input type="hidden" name="id" value={$formData.id} />
			{/if}

			<Form.Field form={taskForm} name="title">
				<Label>{m.label_title()}</Label>
				<Form.Control>
					{#snippet children({ props })}
						<Input
							{...props}
							bind:value={$formData.title}
							placeholder={m.placeholder_task_title()}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={taskForm} name="description">
				<Label>{m.label_description()}</Label>
				<Form.Control>
					{#snippet children({ props })}
						<Textarea
							{...props}
							bind:value={$formData.description}
							placeholder={m.placeholder_task_desc()}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="grid grid-cols-2 gap-4">
				<Form.Field form={taskForm} name="columnId">
					<Label>{m.label_status()}</Label>
					<Form.Control>
						{#snippet children({ props })}
							<Select.Root
								type="single"
								value={$formData.columnId ?? undefined}
								onValueChange={(v) => ($formData.columnId = v)}
								name={props.name}
							>
								<Select.Trigger {...props} class="w-full">
									{$formData.columnId
										? columnConfigMap[$formData.columnId as string]?.label
										: m.placeholder_select_status()}
								</Select.Trigger>
								<Select.Content>
									{#each data.columns as column (column.id)}
										<Select.Item value={column.id} label={column.name}>{column.name}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={taskForm} name="priority">
					<Label>{m.label_priority()}</Label>
					<Form.Control>
						{#snippet children({ props })}
							<Select.Root type="single" bind:value={$formData.priority} name={props.name}>
								<Select.Trigger {...props} class="w-full">
									{$formData.priority
										? ($formData.priority as string).charAt(0).toUpperCase() +
											($formData.priority as string).slice(1)
										: m.priority_medium()}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="low" label={m.priority_low()}>{m.priority_low()}</Select.Item>
									<Select.Item value="medium" label={m.priority_medium()}
										>{m.priority_medium()}</Select.Item
									>
									<Select.Item value="high" label={m.priority_high()}
										>{m.priority_high()}</Select.Item
									>
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Form.Field form={taskForm} name="deadline">
					<Label>{m.label_deadline()}</Label>
					<Form.Control>
						{#snippet children({ props })}
							<Input type="date" {...props} bind:value={$formData.deadline} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={taskForm} name="assignedTo">
					<Label>{m.label_assignee()}</Label>
					<Form.Control>
						{#snippet children({ props })}
							<Select.Root
								type="single"
								value={$formData.assignedTo ?? undefined}
								onValueChange={(v) => ($formData.assignedTo = v)}
								name={props.name}
							>
								<Select.Trigger {...props} class="w-full">
									{$formData.assignedTo
										? // eslint-disable-next-line @typescript-eslint/no-explicit-any
											project.projectUsers.find((pu: any) => pu.user.id === $formData.assignedTo)
												?.user.name
										: m.label_unassigned()}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="" label={m.label_unassigned()}
										>{m.label_unassigned()}</Select.Item
									>
									{#each project.projectUsers as pu (pu.user.id)}
										<Select.Item value={pu.user.id} label={pu.user.name}>{pu.user.name}</Select.Item
										>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<div class="flex justify-end pt-4">
				{#if $delayed}
					<Button disabled>
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
						{isTaskEditMode ? m.btn_updating() : m.btn_adding()}
					</Button>
				{:else}
					<Button type="submit">{isTaskEditMode ? m.btn_update() : m.btn_submit_add_task()}</Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={isTaskDeleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.dialog_delete_task_title()}</AlertDialog.Title>
			<AlertDialog.Description>{m.dialog_delete_task_desc()}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.btn_cancel()}</AlertDialog.Cancel>
			<form method="POST" action="?/deleteTask" use:enhance>
				<input type="hidden" name="taskId" value={taskToDelete} />
				<Button
					variant="destructive"
					type="submit"
					onclick={() => (isTaskDeleteDialogOpen = false)}
				>
					{m.action_delete()}
				</Button>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root bind:open={isManageColumnsOpen}>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>{m.dialog_manage_columns()}</Dialog.Title>
			<Dialog.Description>{m.dialog_manage_columns_desc()}</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="space-y-4">
				{#each data.columns as column (column.id)}
					<div class="flex items-center gap-4 rounded-md border p-3">
						<div class="h-4 w-4 rounded-full" style="background-color: {column.color}"></div>
						<div class="flex-1">
							<div class="text-sm font-medium">{column.name}</div>
							<div class="text-muted-foreground text-xs uppercase">
								WIP: {column.wipLimit || 'Unlimited'}
							</div>
						</div>
						<div class="flex items-center gap-1">
							<form method="POST" action="?/deleteColumn" use:enhance>
								<input type="hidden" name="columnId" value={column.id} />
								<Button variant="ghost" size="icon" type="submit" class="text-destructive h-8 w-8">
									<Trash2 class="h-4 w-4" />
								</Button>
							</form>
						</div>
					</div>
				{/each}
			</div>

			<div class="border-t pt-4">
				<h4 class="mb-2 text-sm font-medium">{m.btn_add_column()}</h4>
				<form method="POST" action="?/createColumn" use:enhance class="grid gap-3">
					<input type="hidden" name="projectId" value={project.id} />
					<div class="grid grid-cols-3 gap-2">
						<div class="col-span-2 space-y-1">
							<Input name="name" placeholder={m.label_column_name()} required />
						</div>
						<div class="space-y-1">
							<Input name="color" type="color" value="#6B7280" class="h-10 px-1" />
						</div>
					</div>
					<Button type="submit" size="sm" class="w-full">
						<Plus class="mr-2 h-4 w-4" />
						{m.btn_add_column()}
					</Button>
				</form>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
