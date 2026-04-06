<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import Plus from '@lucide/svelte/icons/plus';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { formSchema, type FormSchema } from '$lib/schemas/user/user';
	import { type DestroySchema } from '$lib/schemas/user/destroy';
	import { type ResetSchema } from '$lib/schemas/user/reset';
	import { type RoleSchema } from '$lib/schemas/user/role';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { untrack } from 'svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';

	import DataTable from '$lib/components/ui/data-table/DataTable.svelte';
	import { type AllUser, createColumns } from './columns';

	let {
		data
	}: {
		data: {
			form: SuperValidated<Infer<FormSchema>>;
			formDestroy: SuperValidated<Infer<DestroySchema>>;

			formReset: SuperValidated<Infer<ResetSchema>>;
			formRole: SuperValidated<Infer<RoleSchema>>;
			allUser: AllUser[];
			countAllUser: number;
			currentPage: number;
			roles: { id: string; name: string }[];
			user: App.Locals['user'];
		};
	} = $props();
	const form = superForm(
		untrack(() => data.form as SuperValidated<Infer<FormSchema>>),
		{
			id: 'user-create-form',
			resetForm: true,
			warnings: { duplicateId: false },
			validators: zodClient(formSchema),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.msg_user_created());
					isOpen = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || m.msg_user_failed());
				}
			}
		}
	);
	const { form: formData, enhance, delayed } = form;
	let isOpen = $state(false);
	let roleSearch = $state('');
	let filteredRoles = $derived(
		data.roles.filter((role) => role.name.toLowerCase().includes(roleSearch.toLowerCase()))
	);
</script>

<svelte:head>
	<title>{m.user_title()}</title>
	<meta name="description" content={m.user_desc()} />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.user_title()}
			</h2>
			<p class="text-muted-foreground">{m.user_count_msg({ count: data?.countAllUser })}</p>
		</div>
		<div class="flex items-center gap-2">
			<Button onclick={() => (isOpen = true)} size="sm" variant="outline"
				><Plus /> {m.btn_add_user()}</Button
			>
		</div>
	</div>
	<Separator />
	<DataTable
		data={data?.allUser}
		count={data?.countAllUser}
		page={data?.currentPage}
		columns={createColumns(
			data?.formDestroy,
			data?.formReset,
			data?.formRole,
			data?.roles,
			data.user?.role?.level || '99'
		)}
		searchKey="email"
		searchPlaceholder={m.placeholder_filter_users()}
	/>
</div>

<!-- Create user dialog -->
<Dialog.Root bind:open={isOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">{m.dialog_add_user()}</Dialog.Title>
			<Dialog.Description>
				{m.dialog_add_user_desc()}
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/create" use:enhance>
			<Form.Field {form} name="name">
				<Label for="name">{m.label_name()}</Label>
				<Form.Control>
					{#snippet children({ props })}
						<Input
							{...props}
							bind:value={$formData.name}
							autocomplete="name"
							required
							placeholder={m.label_name()}
						/>
					{/snippet}
				</Form.Control>
				<Form.Description />
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="email">
				<Label for="email">{m.label_email()}</Label>
				<Form.Control>
					{#snippet children({ props })}
						<Input
							{...props}
							bind:value={$formData.email}
							autocomplete="email"
							required
							placeholder={m.label_email()}
						/>
					{/snippet}
				</Form.Control>
				<Form.Description />
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Label for="password">{m.label_password()}</Label>
				<Form.Control>
					{#snippet children({ props })}
						<Input
							{...props}
							bind:value={$formData.password}
							autocomplete="current-password"
							type="password"
							required
							placeholder={m.label_password()}
						/>
					{/snippet}
				</Form.Control>
				<Form.Description />
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="confirmPassword">
				<Label for="confirmPassword">{m.label_confirm_password()}</Label>
				<Form.Control>
					{#snippet children({ props })}
						<Input
							{...props}
							bind:value={$formData.confirmPassword}
							autocomplete="off"
							type="password"
							required
							placeholder={m.label_confirm_password()}
						/>
					{/snippet}
				</Form.Control>
				<Form.Description />
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="roleId">
				<Label>{m.label_role()}</Label>
				<Form.Control>
					{#snippet children({ props })}
						<Select.Root type="single" bind:value={$formData.roleId} name={props.name}>
							<Select.Trigger {...props} class="w-full">
								{$formData.roleId
									? data.roles.find((r) => r.id === $formData.roleId)?.name
									: m.placeholder_select_role()}
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
				<Form.Description />
				<Form.FieldErrors />
			</Form.Field>

			<div class="mt-4">
				{#if $delayed}
					<Form.Button disabled class="flex w-full justify-center">
						<LoaderCircle class="animate-spin" />
						{m.btn_please_wait()}
					</Form.Button>
				{:else}
					<Form.Button class="flex w-full justify-center">{m.btn_confirm()}</Form.Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
