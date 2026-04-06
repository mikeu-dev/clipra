<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { untrack } from 'svelte';
	import { userProfileSchema, type UserProfileSchema } from '$lib/schemas/profile/userProfile';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const form = superForm(
		untrack(() => data.form as SuperValidated<Infer<UserProfileSchema>>),
		{
			validators: zodClient(userProfileSchema),
			onUpdated: ({ form: f }) => {
				if (f.valid) {
					toast.success(m.msg_save_success());
				} else {
					toast.error(m.msg_save_error());
				}
			}
		}
	);

	const { form: formData, enhance, submitting } = form;
</script>

<svelte:head>
	<title>{m.profile_title()}</title>
	<meta name="description" content={m.profile_desc()} />
</svelte:head>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">{m.profile_title()}</h3>
		<p class="text-muted-foreground text-sm">
			{m.profile_desc()}
		</p>
	</div>
	<Separator />

	<form method="POST" use:enhance class="space-y-8">
		<!-- Bio (using userId field name as placeholder if bio not in schema or just purely bio) -->
		<!-- Note: schema has 'bio', 'address', 'birthDate', 'gender', 'phone', 'userId' -->
		<!-- We likely don't want to edit userId manually, it should be hidden or excluded -->

		<Form.Field {form} name="bio">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Bio</Form.Label>
					<Textarea {...props} bind:value={$formData.bio} placeholder="Tell us about yourself" />
				{/snippet}
			</Form.Control>
			<Form.Description>
				You can <span>@mention</span> other users and organizations to link to them.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="address">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Address</Form.Label>
					<Input {...props} bind:value={$formData.address} placeholder="Your address" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<Form.Field {form} name="birthDate">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Birth Date</Form.Label>
						<Input type="date" {...props} bind:value={$formData.birthDate} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="gender">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Gender</Form.Label>
						<Select.Root type="single" bind:value={$formData.gender} name={props.name}>
							<Select.Trigger {...props}>
								{$formData.gender ? $formData.gender : 'Select gender'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="male">Male</Select.Item>
								<Select.Item value="female">Female</Select.Item>
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</div>

		<Form.Field {form} name="phone">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Phone</Form.Label>
					<Input {...props} bind:value={$formData.phone} placeholder="+1234567890" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<div class="flex justify-end">
			{#if $submitting}
				<Button disabled>
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					Saving...
				</Button>
			{:else}
				<Button type="submit">Update profile</Button>
			{/if}
		</div>
	</form>
</div>
