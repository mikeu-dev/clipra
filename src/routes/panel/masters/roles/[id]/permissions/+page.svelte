<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();
	let role = $derived(data.role);
	let groupedPermissions = $derived(data.groupedPermissions);
	let rolePermissions = $derived(data.rolePermissions);

	// Simple reactivity for local state if needed, but form submission handles it.
	// We using standard form checking based on server data.
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				Kelola Permissions: {role.name}
			</h2>
			<p class="text-muted-foreground">Atur hak akses untuk role ini.</p>
		</div>
	</div>

	<form
		method="POST"
		action="?/update"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.success_permissions_updated());
				} else {
					toast.error(m.error_update_permissions());
				}
			};
		}}
	>
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each Object.entries(groupedPermissions) as [resource, permissions] (resource)}
				<Card.Root>
					<Card.Header>
						<Card.Title class="capitalize">{resource}</Card.Title>
					</Card.Header>
					<Card.Content class="grid gap-4">
						{#each permissions as permission (permission.id)}
							<div class="flex items-center space-x-2">
								<Checkbox
									id={permission.id}
									name="permissions"
									value={permission.id}
									checked={rolePermissions.includes(permission.name)}
								/>
								<Label
									for={permission.id}
									class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{permission.action}
								</Label>
							</div>
						{/each}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<div class="bg-background sticky bottom-0 z-10 mt-8 flex justify-end py-4">
			<Button type="submit">{m.btn_save_changes()}</Button>
		</div>
	</form>
</div>
