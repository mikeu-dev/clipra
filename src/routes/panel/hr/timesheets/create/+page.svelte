<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	let isLoading = $state(false);
	let tasks: { id: string; title: string }[] = $state([]);

	async function fetchTasks(projectId: string) {
		if (!projectId) {
			tasks = [];
			return;
		}
		const res = await fetch(`/api/projects/${projectId}/tasks`);
		if (res.ok) {
			tasks = await res.json();
		}
	}
</script>

<div class="flex flex-col gap-4 p-4 md:p-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">Log Time</h2>
			<p class="text-muted-foreground">Record your daily work hours.</p>
		</div>
	</div>

	<form
		method="POST"
		action="?/logTime"
		use:enhance={() => {
			isLoading = true;
			return async ({ result }) => {
				isLoading = false;
				if (result.type === 'failure') {
					toast.error('Failed to log time');
				}
			};
		}}
		class="max-w-2xl"
	>
		<Card.Root>
			<Card.Header>
				<Card.Title>Timesheet Details</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2">
					<Label for="date">Date</Label>
					<Input type="date" name="date" required />
				</div>

				<div class="space-y-2">
					<Label for="projectId">Project</Label>
					<select
						name="projectId"
						class="w-full rounded-md border p-2"
						required
						onchange={(e) => fetchTasks(e.currentTarget.value)}
					>
						<option value="">Select Project</option>
						{#each data.projects as project (project.id)}
							<option value={project.id}>{project.name}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2">
					<Label for="taskId">Task (Optional)</Label>
					<select name="taskId" class="w-full rounded-md border p-2">
						<option value="">Select Task</option>
						{#each tasks as task (task.id)}
							<option value={task.id}>{task.title}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2">
					<Label for="hours">Hours</Label>
					<Input type="number" name="hours" step="0.5" min="0" max="24" required />
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<Input name="description" placeholder="What did you work on?" />
				</div>
			</Card.Content>
			<Card.Footer>
				<Button type="submit" disabled={isLoading}>
					{#if isLoading}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Saving...
					{:else}
						Submit Timesheet
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
