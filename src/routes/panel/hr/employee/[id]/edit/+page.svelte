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
	import Wallet from '@lucide/svelte/icons/wallet';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const form = superForm(data.form, {
		validators: zod(employeeFormSchema),
		onResult: ({ result }) => {
			if (result.type === 'failure') {
				toast.error('Gagal memperbarui data karyawan');
			} else if (result.type === 'redirect') {
				toast.success(m.toast_success_employee_updated());
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
	<title>Edit Karyawan - {data.employee.user?.name}</title>
</svelte:head>

<div class="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				Edit Data Karyawan
			</h2>
			<p class="text-muted-foreground">Kelola informasi detail dan pengaturan payroll karyawan.</p>
		</div>
	</div>
	<Separator />

	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Left Side: Main Form (2 columns wide) -->
		<div class="space-y-8 lg:col-span-2">
			<form method="POST" use:enhance class="space-y-8">
				<div class="grid gap-6 md:grid-cols-2">
					<!-- Section 1: Account & Company -->
					<Card.Root>
						<Card.Header>
							<div class="flex items-center gap-2">
								<UserIcon class="text-primary h-5 w-5" />
								<Card.Title>Akun & Perusahaan</Card.Title>
							</div>
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
						</Card.Header>
						<Card.Content class="space-y-4">
							<Form.Field {form} name="positionId">
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

							<div class="grid grid-cols-2 gap-4">
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
							</div>
						</Card.Content>
					</Card.Root>

					<!-- Section 3: Identity & Contact -->
					<Card.Root>
						<Card.Header>
							<div class="flex items-center gap-2">
								<IdCard class="text-primary h-5 w-5" />
								<Card.Title>Identitas & Kontak</Card.Title>
							</div>
						</Card.Header>
						<Card.Content class="grid grid-cols-2 gap-4">
							<Form.Field {form} name="nik" class="col-span-2">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>NIK (Nomor Induk Karyawan)</Form.Label>
										<Input {...props} bind:value={$formData.nik} />
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

							<Form.Field {form} name="taxNumber">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Tax Number (NPWP)</Form.Label>
										<Input {...props} bind:value={$formData.taxNumber} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field {form} name="workEmail">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Email Kerja</Form.Label>
										<Input type="email" {...props} bind:value={$formData.workEmail} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field {form} name="workPhone">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Telepon Kerja</Form.Label>
										<Input {...props} bind:value={$formData.workPhone} />
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
													<Select.Item
														value={bank.name ?? ''}
														label={bank.name ?? 'Unnamed Bank'}
													/>
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
										<Input {...props} bind:value={$formData.bankAccountNumber} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</Card.Content>
					</Card.Root>
				</div>

				<div class="flex items-center justify-end gap-4 border-t pt-6">
					<Button variant="outline" href={localizeHref('/panel/hr/employee')}>{m.btn_back()}</Button
					>
					<Button type="submit" disabled={$delayed} class="min-w-[150px]">
						{#if $delayed}
							<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
							Menyimpan...
						{:else}
							{m.btn_save_changes()}
						{/if}
					</Button>
				</div>
			</form>
		</div>

		<!-- Right Side: Salary & Components (1 column wide) -->
		<div class="space-y-8">
			<!-- Current Salary -->
			<Card.Root class="border-primary/20 bg-primary/5 shadow-sm">
				<Card.Header>
					<div class="text-primary flex items-center gap-2">
						<Wallet class="h-5 w-5" />
						<Card.Title>Gaji Pokok</Card.Title>
					</div>
				</Card.Header>
				<Card.Content>
					{#if data.currentSalary}
						<div class="space-y-1">
							<p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
								Nominal per Bulan
							</p>
							<p class="text-3xl font-bold">
								{new Intl.NumberFormat('id-ID', {
									style: 'currency',
									currency: 'IDR',
									minimumFractionDigits: 0
								}).format(parseFloat(data.currentSalary.amount))}
							</p>
							<p class="text-muted-foreground pt-2 text-xs italic">
								Mulai berlaku: {new Date(data.currentSalary.effectiveDate).toLocaleDateString(
									'id-ID',
									{
										dateStyle: 'long'
									}
								)}
							</p>
						</div>
					{:else}
						<div class="rounded-md border border-dashed p-4 text-center">
							<p class="text-muted-foreground text-sm">Belum ada data gaji.</p>
						</div>
					{/if}

					<Separator class="my-4" />

					<form method="POST" action="?/setSalary" class="space-y-3">
						<p class="text-sm font-semibold">Update Gaji Baru</p>
						<div class="grid gap-2">
							<Input name="amount" type="number" required placeholder="Nominal (IDR)" />
							<Input name="effectiveDate" type="date" required />
						</div>
						<Button type="submit" variant="outline" size="sm" class="w-full">Update Gaji</Button>
					</form>
				</Card.Content>
			</Card.Root>

			<!-- Components -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between">
						<Card.Title class="text-lg">Tunjangan & Potongan</Card.Title>
					</div>
				</Card.Header>
				<Card.Content class="space-y-6">
					{#if data.assignedComponents && data.assignedComponents.length > 0}
						<div class="space-y-3">
							{#each data.assignedComponents as item (item.assignment.id)}
								<div class="flex items-center justify-between gap-2 text-sm">
									<div class="flex flex-col">
										<span class="font-semibold">{item.component.name}</span>
										<span class="text-muted-foreground text-[10px] uppercase">
											{item.component.type === 'allowance' ? 'Tunjangan' : 'Potongan'}
										</span>
									</div>
									<div class="flex items-center gap-2">
										<span
											class={item.component.type === 'allowance'
												? 'font-medium text-green-600'
												: 'font-medium text-red-600'}
										>
											{item.component.type === 'allowance' ? '+' : '-'}
											{new Intl.NumberFormat('id-ID', {
												minimumFractionDigits: 0
											}).format(parseFloat(item.assignment.amount || '0'))}
										</span>
										<form method="POST" action="?/removeComponent">
											<input type="hidden" name="assignmentId" value={item.assignment.id} />
											<Button
												variant="ghost"
												size="icon"
												class="text-destructive h-8 w-8"
												type="submit"
											>
												<Trash2 class="h-4 w-4" />
											</Button>
										</form>
									</div>
								</div>
								<Separator />
							{/each}
						</div>
					{:else}
						<p class="text-muted-foreground text-center text-sm italic">Belum ada komponen gaji.</p>
					{/if}

					<div class="pt-2">
						{#if data.availableComponents && data.availableComponents.length > 0}
							<form
								method="POST"
								action="?/assignComponent"
								class="bg-muted/30 space-y-3 rounded-lg p-3"
							>
								<p class="text-xs font-bold tracking-tight uppercase">{m.label_add_component()}</p>
								<select
									name="componentId"
									class="bg-background w-full rounded-md border px-3 py-2 text-sm"
								>
									{#each data.availableComponents as comp (comp.id)}
										<option value={comp.id}>
											{comp.name} ({comp.type === 'allowance' ? 'Tunj.' : 'Pot.'})
										</option>
									{/each}
								</select>
								<div class="flex gap-2">
									<Input
										name="amount"
										type="number"
										placeholder="Nominal"
										class="h-9 px-2 text-sm"
									/>
									<Button type="submit" size="sm"
										><Plus class="mr-1 h-3 w-3" /> {m.btn_add()}</Button
									>
								</div>
							</form>
						{:else}
							<p class="text-muted-foreground text-center text-[10px] italic">
								Semua komponen tersedia telah ditambahkan atau belum ada master komponen.
							</p>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
