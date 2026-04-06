<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();
	let isLoading = $state(false);
</script>

<div class="flex flex-col gap-4 p-4 md:p-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.expense_record_title()}
			</h2>
			<p class="text-muted-foreground">{m.expense_record_desc()}</p>
		</div>
	</div>

	<form
		method="POST"
		action="?/createExpense"
		use:enhance={() => {
			isLoading = true;
			return async ({ result }) => {
				isLoading = false;
				if (result.type === 'failure') {
					toast.error(m.msg_record_expense_error());
				}
			};
		}}
		class="max-w-2xl"
	>
		<Card.Root>
			<Card.Header>
				<Card.Title>{m.label_expense_details()}</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2">
					<Label for="projectId">{m.label_project()}</Label>
					<select name="projectId" class="w-full rounded-md border p-2" required>
						<option value="">{m.placeholder_select_project()}</option>
						{#each data.projects as project (project.id)}
							<option value={project.id}>{project.name}</option>
						{/each}
					</select>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="date">{m.label_date()}</Label>
						<Input type="date" name="date" required />
					</div>

					<div class="space-y-2">
						<Label for="category">{m.label_category()}</Label>
						<select name="category" class="w-full rounded-md border p-2">
							<option value="Travel">Travel</option>
							<option value="Meals">Meals</option>
							<option value="Software">Software</option>
							<option value="Hardware">Hardware</option>
							<option value="Office Supplies">Office Supplies</option>
							<option value="Other">Other</option>
						</select>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="description">{m.label_description()}</Label>
					<Input name="description" placeholder={m.placeholder_expense_desc()} required />
				</div>

				<div class="space-y-2">
					<Label for="amount">{m.label_amount()}</Label>
					<Input type="number" name="amount" min="0" required />
				</div>
			</Card.Content>
			<Card.Footer>
				<Button type="submit" disabled={isLoading}>
					{#if isLoading}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> {m.btn_saving()}
					{:else}
						{m.btn_submit_expense()}
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
