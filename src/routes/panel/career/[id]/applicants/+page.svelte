<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import Download from '@lucide/svelte/icons/download';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function getStatusColor(status: string) {
		switch (status) {
			case 'pending':
				return 'bg-yellow-500';
			case 'reviewed':
				return 'bg-blue-500';
			case 'interview':
				return 'bg-purple-500';
			case 'hired':
				return 'bg-green-500';
			case 'rejected':
				return 'bg-red-500';
			default:
				return 'bg-gray-500';
		}
	}
</script>

<svelte:head>
	<title>Pelamar: {data.job.title} - ERP</title>
</svelte:head>

<div class="flex flex-1 flex-col gap-4 p-4 md:p-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				Pelamar: {data.job.title}
			</h2>
			<p class="text-muted-foreground">Total {data.applicants.length} pelamar.</p>
		</div>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Nama</Table.Head>
					<Table.Head>Kontak</Table.Head>
					<Table.Head>Tanggal Melamar</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head>Resume</Table.Head>
					<Table.Head class="text-right">Aksi</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if data.applicants.length === 0}
					<Table.Row>
						<Table.Cell colspan={6} class="text-muted-foreground h-24 text-center">
							Belum ada pelamar untuk posisi ini.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each data.applicants as applicant (applicant.id)}
						<Table.Row>
							<Table.Cell class="font-medium">
								<div>{applicant.name}</div>
							</Table.Cell>
							<Table.Cell>
								<div class="text-sm">{applicant.email}</div>
								<div class="text-muted-foreground text-xs">{applicant.phone}</div>
							</Table.Cell>
							<Table.Cell
								>{applicant.createdAt
									? new Date(applicant.createdAt).toLocaleDateString()
									: 'N/A'}</Table.Cell
							>
							<Table.Cell>
								<Badge class={getStatusColor(applicant.status)}>{applicant.status}</Badge>
							</Table.Cell>
							<Table.Cell>
								{#if applicant.resume}
									<a
										href={applicant.resume}
										target="_blank"
										class="flex items-center gap-1 text-sm text-blue-600 hover:underline"
									>
										<Download class="h-3 w-3" /> CV
									</a>
								{:else}
									<span class="text-muted-foreground text-xs">No File</span>
								{/if}
							</Table.Cell>
							<Table.Cell class="text-right">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button {...props} variant="ghost" size="icon" class="h-8 w-8">
												<EllipsisVertical class="h-4 w-4" />
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Label>Ubah Status</DropdownMenu.Label>
										<form
											action="?/updateStatus"
											method="POST"
											use:enhance={() => {
												return async ({ result }) => {
													if (result.type === 'success') {
														toast.success(m.toast_success_status_changed());
													}
												};
											}}
										>
											<input type="hidden" name="id" value={applicant.id} />
											{#each ['pending', 'reviewed', 'interview', 'hired', 'rejected'] as status (status)}
												<button
													class="hover:bg-muted w-full rounded-sm px-2 py-1.5 text-left text-sm capitalize"
													name="status"
													value={status}
													type="submit"
												>
													{status}
												</button>
											{/each}
										</form>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
