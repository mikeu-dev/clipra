<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	// Note: superForm captures data.form at initialization, which is intentional
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed } = superForm(data.form, {
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Device added successfully');
				open = false;
			} else if (result.type === 'failure') {
				toast.error('Failed to add device');
			}
		}
	});

	let open = $state(false);
</script>

<div class="flex h-full flex-1 flex-col gap-4 p-4 md:p-8">
	<div class="flex items-center justify-between">
		<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			Devices Configuration
		</h2>
		<Dialog.Root bind:open>
			<Dialog.Trigger>
				<Button>Add Device</Button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Add New Device</Dialog.Title>
					<Dialog.Description>
						Configure your Hikvision Device connection details.
					</Dialog.Description>
				</Dialog.Header>

				<form method="POST" action="?/create" use:enhance class="grid gap-4 py-4">
					<div class="grid gap-2">
						<label for="name" class="text-sm font-medium">Name</label>
						<Input id="name" name="name" bind:value={$form.name} placeholder="Front Door" />
						{#if $errors.name}<span class="text-sm text-red-500">{$errors.name}</span>{/if}
					</div>
					<div class="grid gap-2">
						<label for="ipAddress" class="text-sm font-medium">IP Address</label>
						<Input
							id="ipAddress"
							name="ipAddress"
							bind:value={$form.ipAddress}
							placeholder="192.168.1.64"
						/>
						{#if $errors.ipAddress}<span class="text-sm text-red-500">{$errors.ipAddress}</span
							>{/if}
					</div>
					<div class="grid gap-2">
						<label for="port" class="text-sm font-medium">Port</label>
						<Input type="number" id="port" name="port" bind:value={$form.port} placeholder="80" />
						{#if $errors.port}<span class="text-sm text-red-500">{$errors.port}</span>{/if}
					</div>
					<div class="grid gap-2">
						<label for="username" class="text-sm font-medium">Username</label>
						<Input id="username" name="username" bind:value={$form.username} placeholder="admin" />
						{#if $errors.username}<span class="text-sm text-red-500">{$errors.username}</span>{/if}
					</div>
					<div class="grid gap-2">
						<label for="password" class="text-sm font-medium">Password</label>
						<Input type="password" id="password" name="password" bind:value={$form.password} />
						{#if $errors.password}<span class="text-sm text-red-500">{$errors.password}</span>{/if}
					</div>
					<Dialog.Footer>
						<Button type="submit" disabled={$delayed}>
							{$delayed ? 'Saving...' : 'Save Configuration'}
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>IP Address</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Action</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.devices as device (device.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{device.name}</Table.Cell>
						<Table.Cell>{device.ipAddress}:{device.port}</Table.Cell>
						<Table.Cell>
							<span class={device.isActive ? 'text-green-600' : 'text-red-600'}>
								{device.isActive ? 'Active' : 'Inactive'}
							</span>
						</Table.Cell>
						<Table.Cell class="text-right">
							<Button variant="ghost" size="sm">Edit</Button>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={4} class="h-24 text-center">No devices found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
