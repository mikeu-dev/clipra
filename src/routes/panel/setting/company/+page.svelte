<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import * as Card from '$lib/components/ui/card';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from './$types';
	import { toast } from 'svelte-sonner';

	import type { PageData } from './$types';

	interface CompanyData {
		id?: string;
		name?: string;
		slug?: string;
		themeConfig?: Record<string, unknown>;
		isPublic?: boolean;
		email?: string;
		phone?: string;
		address?: string;
		website?: string;
	}

	let { data }: { data: PageData } = $props();
	let company: CompanyData = $derived(
		(data.company as CompanyData) || ({ themeConfig: {} } as CompanyData)
	);
	let themeConfig = $derived((company.themeConfig as Record<string, unknown>) || {});

	// Switch binding needs boolean, form requires input submission
	// We bind switch to a variable, and use a hidden input for form submission
	let isPublic = $state(false);

	$effect(() => {
		if (company && typeof company.isPublic !== 'undefined') {
			isPublic = !!company.isPublic;
		}
	});

	const handleResult: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type === 'success') {
				toast.success('Settings updated successfully');
			} else {
				toast.error('Failed to update settings');
			}
		};
	};
</script>

<div class="flex max-w-4xl flex-col gap-6 p-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			Company Settings
		</h1>
		<p class="text-muted-foreground">Manage your company profile and public presence.</p>
	</div>

	<form method="POST" action="?/update" use:enhance={handleResult} class="space-y-6">
		<!-- Contact Info -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Contact Information</Card.Title>
				<Card.Description>Displayed on your invoices and public profile.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" name="email" value={company.email} />
				</div>
				<div class="space-y-2">
					<Label for="phone">Phone</Label>
					<Input id="phone" name="phone" value={company.phone} />
				</div>
				<div class="space-y-2 md:col-span-2">
					<Label for="address">Address</Label>
					<Textarea id="address" name="address" value={company.address} />
				</div>
				<div class="space-y-2 md:col-span-2">
					<Label for="website">Website</Label>
					<Input id="website" name="website" value={company.website} />
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Public Profile -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Public Profile Configuration</Card.Title>
				<Card.Description>Settings for your public landing page ({company.slug}).</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex items-center space-x-2">
					<Switch id="isPublic" bind:checked={isPublic} />
					<Label for="isPublic">Enable Public Profile</Label>
					<input type="hidden" name="isPublic" value={isPublic ? 'on' : 'off'} />
				</div>

				<div class="space-y-2">
					<Label for="slug">URL Slug</Label>
					<div class="flex items-center gap-1">
						<span class="text-muted-foreground text-sm">/p/</span>
						<Input id="slug" name="slug" value={company.slug} />
					</div>
				</div>

				<div class="space-y-2">
					<Label for="description">Tagline / Short Description</Label>
					<Input
						id="description"
						name="description"
						value={(themeConfig.description as string) || ''}
						placeholder="Ex: Innovating the future"
					/>
				</div>

				<div class="space-y-2">
					<Label for="about">About Us (Detailed)</Label>
					<Textarea
						id="about"
						name="about"
						value={(themeConfig.about as string) || ''}
						rows={5}
						placeholder="Full description of your company..."
					/>
				</div>

				<div class="space-y-2">
					<Label for="primaryColor">Primary Theme Color</Label>
					<div class="flex items-center gap-2">
						<Input
							type="color"
							id="primaryColor"
							name="primaryColor"
							value={(themeConfig.primaryColor as string) || '#4f46e5'}
							class="h-10 w-16 p-1"
						/>
						<Input
							value={(themeConfig.primaryColor as string) || '#4f46e5'}
							readonly
							class="w-24"
						/>
					</div>
				</div>
			</Card.Content>
			<Card.Footer>
				<Button type="submit">Save Changes</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
