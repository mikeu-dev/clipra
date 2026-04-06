<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { employeeFormSchema } from '$lib/schemas/employee/employee';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card';
	import UserIcon from '@lucide/svelte/icons/user';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import IdCard from '@lucide/svelte/icons/id-card';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const form = superForm(data.form, {
		validators: zod(employeeFormSchema),
		onResult: ({ result }) => {
			if (result.type === 'failure') {
				toast.error('Gagal membuat data karyawan');
			} else if (result.type === 'redirect') {
				toast.success(m.toast_success_employee_created());
			}
		}
	});

	const { form: formData, enhance, delayed } = form;

	// Filter positions and shifts based on selected company
	let filteredPositions = $derived(
		data.options.positions.filter((p) => !p.companyId || p.companyId === $formData.companyId)
	);
	let filteredShifts = $derived(
		data.options.shifts.filter((s) => !s.companyId || s.companyId === $formData.companyId)
	);
</script>

<svelte:head>
	<title>{m.btn_add_employee()}</title>
</svelte:head>

<div class="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.btn_add_employee()}
			</h2>
			<p class="text-muted-foreground">{m.employee_desc()}</p>
		</div>
	</div>
	<Separator />

	<form method="POST" use:enhance class="space-y-8">
		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Section 1: Account & Company -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-2">
						<UserIcon class="text-primary h-5 w-5" />
						<Card.Title>Akun & Perusahaan</Card.Title>
					</div>
					<Card.Description>Pilih akun user dan perusahaan penempatan.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<Form.Field {form} name="userId">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>User Account</Form.Label>
								<Select.Root type="single" bind:value={$formData.userId} name={props.name}>
									<Select.Trigger {...props} class="w-full">
										{$formData.userId
											? data.options.users.find((u) => u.id === $formData.userId)?.name
											: 'Select User'}
									</Select.Trigger>
									<Select.Content>
										{#each data.options.users as user (user.id)}
											<Select.Item
												value={user.id}
												label={`${user.name} (${user.roleName ?? 'No Role'})`}
											/>
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="companyId">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Company</Form.Label>
								<Select.Root type="single" bind:value={$formData.companyId} name={props.name}>
									<Select.Trigger {...props} class="w-full">
										{$formData.companyId
											? data.options.companies.find((c) => c.id === $formData.companyId)?.name
											: 'Select Company'}
									</Select.Trigger>
									<Select.Content>
										{#each data.options.companies as company (company.id)}
											<Select.Item value={company.id} label={company.name} />
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Card.Content>
			</Card.Root>

			<!-- Section 2: Position & Contract -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-2">
						<Briefcase class="text-primary h-5 w-5" />
						<Card.Title>Jabatan & Penugasan</Card.Title>
					</div>
					<Card.Description>Informasi mengenai posisi dan jadwal kerja.</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-4 sm:grid-cols-2">
					<Form.Field {form} name="positionId" class="sm:col-span-2">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Position</Form.Label>
								<Select.Root
									type="single"
									bind:value={$formData.positionId}
									name={props.name}
									disabled={!$formData.companyId}
								>
									<Select.Trigger {...props} class="w-full">
										{$formData.positionId
											? data.options.positions.find((p) => p.id === $formData.positionId)?.name
											: 'Select Position'}
									</Select.Trigger>
									<Select.Content>
										{#each filteredPositions as position (position.id)}
											<Select.Item value={position.id} label={position.name ?? 'Unnamed'} />
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="shiftId">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Shift</Form.Label>
								<Select.Root
									type="single"
									bind:value={$formData.shiftId}
									name={props.name}
									disabled={!$formData.companyId}
								>
									<Select.Trigger {...props} class="w-full">
										{$formData.shiftId
											? data.options.shifts.find((s) => s.id === $formData.shiftId)?.name
											: 'Select Shift'}
									</Select.Trigger>
									<Select.Content>
										{#each filteredShifts as shift (shift.id)}
											<Select.Item value={shift.id} label={shift.name ?? 'Unnamed'} />
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="status">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Status</Form.Label>
								<Select.Root type="single" bind:value={$formData.status} name={props.name}>
									<Select.Trigger {...props} class="w-full capitalize"
										>{$formData.status}</Select.Trigger
									>
									<Select.Content>
										<Select.Item value="probation" label="Probation" />
										<Select.Item value="permanent" label="Permanent" />
										<Select.Item value="contract" label="Contract" />
										<Select.Item value="internship" label="Internship" />
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Card.Content>
			</Card.Root>

			<!-- Section 3: Identity & Identity -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-2">
						<IdCard class="text-primary h-5 w-5" />
						<Card.Title>Identitas & Kontak</Card.Title>
					</div>
					<Card.Description>Data identitas resmi dan info kontak kerja.</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-4 sm:grid-cols-2">
					<Form.Field {form} name="nik">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>NIK (Nomor Induk Karyawan)</Form.Label>
								<Input {...props} bind:value={$formData.nik} placeholder="e.g. 2026001" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="joinDate">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Join Date</Form.Label>
								<Input type="date" {...props} bind:value={$formData.joinDate} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="workEmail">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Work Email</Form.Label>
								<Input
									type="email"
									{...props}
									bind:value={$formData.workEmail}
									placeholder="email@company.com"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="workPhone">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Work Phone</Form.Label>
								<Input {...props} bind:value={$formData.workPhone} placeholder="0812xxxx" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Card.Content>
			</Card.Root>

			<!-- Section 4: Bank Account -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-2">
						<CreditCard class="text-primary h-5 w-5" />
						<Card.Title>Informasi Perbankan</Card.Title>
					</div>
					<Card.Description>Data rekening untuk keperluan payroll.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<Form.Field {form} name="bankName">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Nama Bank</Form.Label>
								<Select.Root type="single" bind:value={$formData.bankName} name={props.name}>
									<Select.Trigger {...props} class="w-full">
										{$formData.bankName || 'Pilih Bank'}
									</Select.Trigger>
									<Select.Content>
										{#each data.options.banks as bank (bank.id)}
											<Select.Item value={bank.name ?? ''} label={bank.name ?? 'Unnamed Bank'} />
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="bankAccountNumber">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Nomor Rekening</Form.Label>
								<Input
									{...props}
									bind:value={$formData.bankAccountNumber}
									placeholder="0123456789"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Card.Content>
			</Card.Root>
		</div>

		<div class="flex items-center justify-end gap-4 border-t pt-6">
			<Button variant="outline" href={localizeHref('/panel/hr/employee')}>{m.btn_cancel()}</Button>
			<Button type="submit" disabled={$delayed} class="min-w-[150px]">
				{#if $delayed}
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					Menyimpan...
				{:else}
					{m.btn_save()}
				{/if}
			</Button>
		</div>
	</form>
</div>
