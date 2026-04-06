<script lang="ts">
	import type { PageData } from './$types.js';
	import Login from './login.svelte';
	let { data }: { data: PageData } = $props();
</script>

<Login {data} />
