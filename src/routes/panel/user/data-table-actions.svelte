<script lang="ts" module>
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Eye from '@lucide/svelte/icons/eye';
	import UserCog from '@lucide/svelte/icons/user-cog';
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { untrack } from 'svelte';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { type DestroySchema } from '$lib/schemas/user/destroy';
	import { type ResetSchema } from '$lib/schemas/user/reset';
	import { type RoleSchema } from '$lib/schemas/user/role';
	import { type SuperValidated, type Infer } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';

	let {
		id,
		formReset,
		formDestroy,
		formRole,
		roles,
		roleId,
		roleLevel,
		executorLevel
	}: {
		id: string;
		formReset: SuperValidated<Infer<ResetSchema>>;
		formDestroy: SuperValidated<Infer<DestroySchema>>;
		formRole: SuperValidated<Infer<RoleSchema>>;
		roles: { id: string; name: string }[];
		roleId: string;
		roleLevel: string;
		executorLevel: string;
	} = $props();

	const canManage = $derived(
		executorLevel !== undefined &&
			roleLevel !== undefined &&
			Number(executorLevel) < Number(roleLevel)
	);
	const destroyForm = superForm(
		untrack(() => formDestroy),
		{
			id: untrack(() => `destroy-form-${id}`),
			resetForm: true,
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success('User deleted successfully');
					isOpenDestroy = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || 'Failed to delete user');
				}
			}
		}
	);
	const { enhance: enhanceDestroy, delayed: delayedDestroy } = destroyForm;

	const resetForm = superForm(
		untrack(() => formReset),
		{
			id: untrack(() => `reset-form-${id}`),
			resetForm: true,
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.toast_success_form_reset());
					isOpenReset = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || m.toast_error_form_reset());
				}
			}
		}
	);
	const { enhance: enhanceReset, delayed: delayedReset } = resetForm;

	let isOpenDestroy = $state(false);
	let isOpenReset = $state(false);
	let isOpenRole = $state(false);
	let roleSearch = $state('');

	const roleForm = superForm(
		untrack(() => formRole),
		{
			id: untrack(() => `role-form-${id}`),
			resetForm: true,
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.toast_success_role_updated());
					isOpenRole = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || m.toast_error_role_updated());
				}
			}
		}
	);

	const { form: formDataRole, enhance: enhanceRole, delayed: delayedRole } = roleForm;

	let filteredRoles = $derived(
		roles.filter((role) => role.name.toLowerCase().includes(roleSearch.toLowerCase()))
	);

	// Initialize form data when dialog opens
	$effect(() => {
		if (isOpenRole) {
			$formDataRole.id = id;
			$formDataRole.roleId = roleId;
		}
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>

			<DropdownMenu.Item disabled={!canManage}>
				<Button
					onclick={() => (isOpenDestroy = true)}
					size="sm"
					variant="ghost"
					disabled={!canManage}><Trash2 /> Delete</Button
				>
			</DropdownMenu.Item>

			<DropdownMenu.Item disabled={!canManage}>
				<Button onclick={() => (isOpenReset = true)} size="sm" variant="ghost" disabled={!canManage}
					><RotateCcw /> Reset password</Button
				>
			</DropdownMenu.Item>

			<DropdownMenu.Item disabled={!canManage}>
				<Button onclick={() => (isOpenRole = true)} size="sm" variant="ghost" disabled={!canManage}
					><UserCog /> Change Role</Button
				>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>
			<Button href={`/panel/user/${id}`} size="sm" variant="ghost"><Eye /> View profile</Button>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- User delete dialog -->
<Dialog.Root bind:open={isOpenDestroy}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Delete User</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this user? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<!-- Form delete -->
		<form method="POST" action="?/destroy" use:enhanceDestroy>
			<input type="hidden" name="id" value={id} />

			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (isOpenDestroy = false)}>
					Cancel
				</Button>
				{#if $delayedDestroy}
					<Button disabled variant="destructive">
						<LoaderCircle class="animate-spin" />
						Please wait
					</Button>
				{:else}
					<Button type="submit" variant="destructive">Delete</Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- User reset dialog -->
<Dialog.Root bind:open={isOpenReset}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Reset Password User</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to reset password this user? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<!-- Form delete -->
		<form method="POST" action="?/reset" use:enhanceReset>
			<input type="hidden" name="id" value={id} />

			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (isOpenReset = false)}>
					Cancel
				</Button>
				{#if $delayedReset}
					<Button disabled variant="destructive">
						<LoaderCircle class="animate-spin" />
						Please wait
					</Button>
				{:else}
					<Button type="submit" variant="destructive">Reset</Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- User change role dialog -->
<Dialog.Root bind:open={isOpenRole}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Change User Role</Dialog.Title>
			<Dialog.Description>Select a new role for this user.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/updateRole" use:enhanceRole class="space-y-4">
			<input type="hidden" name="id" value={$formDataRole.id} />

			<Form.Field form={roleForm} name="roleId">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Role</Form.Label>
						<Select.Root type="single" bind:value={$formDataRole.roleId} name={props.name}>
							<Select.Trigger {...props}>
								{$formDataRole.roleId
									? roles.find((r) => r.id === $formDataRole.roleId)?.name
									: 'Select a role'}
							</Select.Trigger>
							<Select.Content class="max-h-[200px] overflow-y-auto">
								<div class="bg-popover sticky top-0 z-10 p-2">
									<Input
										placeholder={m.placeholder_search_role()}
										bind:value={roleSearch}
										class="h-8"
										onkeydown={(e) => e.stopPropagation()}
									/>
								</div>
								{#each filteredRoles as role (role.id)}
									<Select.Item value={role.id} label={role.name} />
								{:else}
									<div class="px-2 py-4 text-center text-sm text-muted-foreground">
										Tidak ada role ditemukan
									</div>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (isOpenRole = false)}>Cancel</Button>
				{#if $delayedRole}
					<Button disabled>
						<LoaderCircle class="animate-spin" />
						Saving...
					</Button>
				{:else}
					<Button type="submit">Save Changes</Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
