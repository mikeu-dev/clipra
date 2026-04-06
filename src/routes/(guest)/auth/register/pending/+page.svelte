<script lang="ts">
	import type { PageData } from './$types';
	import Register from '../register.svelte';
	let { data }: { data: PageData } = $props();
</script>

<Register {data} />
