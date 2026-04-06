<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	interface TeamMember {
		id: string;
		name: string;
		position: string | null;
		image: string | null;
		reportsTo: string | null;
		division: string | null;
	}

	let { teamContent, teams = [] as TeamMember[] } = $props();

	// Definisi urutan divisi agar tampilan konsisten
	const divisionOrder = [
		'Board',
		'Management',
		'Finance',
		'HR & Development',
		'Marketing & Operations'
	];

	// Urutan posisi dalam grup (opsional, untuk memastikan Komisaris Utama di atas)
	const positionOrder = ['Komisaris Utama', 'Komisaris', 'Direktur'];

	// Mengelompokkan tim berdasarkan divisi
	let groupedTeams = $derived.by(() => {
		const groups: Record<string, TeamMember[]> = {};

		teams.forEach((member) => {
			const div = member.division || 'Lainnya';
			if (!groups[div]) groups[div] = [];
			groups[div].push(member);
		});

		// Urutkan berdasarkan priority divisi
		return Object.keys(groups)
			.sort((a, b) => {
				const indexA = divisionOrder.indexOf(a);
				const indexB = divisionOrder.indexOf(b);
				if (indexA !== -1 && indexB !== -1) return indexA - indexB;
				if (indexA !== -1) return -1;
				if (indexB !== -1) return 1;
				return a.localeCompare(b);
			})
			.map((name) => {
				// Urutkan anggota di dalam divisi (misal: KomUta dulu)
				const sortedMembers = [...groups[name]].sort((a, b) => {
					const indexA = positionOrder.indexOf(a.position ?? '');
					const indexB = positionOrder.indexOf(b.position ?? '');
					if (indexA !== -1 && indexB !== -1) return indexA - indexB;
					if (indexA !== -1) return -1;
					if (indexB !== -1) return 1;
					return a.name.localeCompare(b.name);
				});

				return {
					name,
					members: sortedMembers
				};
			});
	});
</script>

<section
	id="teams"
	class="bg-white py-24 font-mono text-gray-800 transition-colors sm:py-32 dark:bg-slate-900 dark:text-gray-100"
>
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="max-w-xl">
			<h2 class="text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
				{teamContent.heading}
			</h2>
			<p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
				{teamContent.description}
			</p>
		</div>

		<div class="mt-20 space-y-20">
			{#each groupedTeams as group (group.name)}
				<div class="space-y-10">
					<div class="flex items-center gap-4">
						<h3 class="text-2xl font-bold text-blue-600 dark:text-blue-400">{group.name}</h3>
						<div class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
					</div>

					<ul role="list" class="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
						{#each group.members as member (member.id)}
							<li>
								<div class="flex items-center gap-x-6">
									<img
										class="h-20 w-20 rounded-full border-2 border-blue-100 object-cover shadow-sm dark:border-blue-900/50"
										src={member.image || 'https://ui-avatars.com/api/?name=' + member.name}
										alt={member.name}
									/>
									<div>
										<h3
											class="text-base leading-7 font-semibold tracking-tight text-gray-900 dark:text-white"
										>
											{member.name}
										</h3>
										<p class="text-sm leading-6 font-semibold text-blue-600 dark:text-blue-400">
											{member.position}
										</p>
									</div>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{:else}
				<div class="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
					{#each [0, 1, 2, 3, 4, 5] as i (i)}
						<li>
							<div class="flex items-center gap-x-6 animate-pulse">
								<Skeleton class="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
								<div class="space-y-2">
									<Skeleton class="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
									<Skeleton class="h-3 w-24 rounded bg-blue-200 dark:bg-blue-500/50" />
								</div>
							</div>
						</li>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</section>
