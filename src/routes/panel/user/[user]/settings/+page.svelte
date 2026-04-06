<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">{m.menu_general_settings()}</h3>
		<p class="text-muted-foreground text-sm">Manage your account settings and preferences.</p>
	</div>
	<Separator />

	<!-- Example Setting: Change Password -->
	<div class="space-y-4">
		<h4 class="text-sm font-medium">Change Password</h4>
		<div class="grid gap-2">
			<Label for="current-password">Current Password</Label>
			<Input id="current-password" type="password" />
		</div>
		<div class="grid gap-2">
			<Label for="new-password">New Password</Label>
			<Input id="new-password" type="password" />
		</div>
		<div class="grid gap-2">
			<Label for="confirm-password">Confirm Password</Label>
			<Input id="confirm-password" type="password" />
		</div>
		<Button>Update Password</Button>
	</div>
</div>
