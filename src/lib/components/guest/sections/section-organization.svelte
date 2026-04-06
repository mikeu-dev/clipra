<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';

	interface TeamMember {
		id: string;
		name: string;
		position: string | null;
		image: string | null;
		reportsTo: string | null;
		division: string | null;
		children?: TeamMember[];
	}

	interface Props {
		teams: TeamMember[];
	}

	let { teams }: Props = $props();

	let root = $derived.by(() => {
		const teamMap = new SvelteMap<string, TeamMember>();
		// Deep clone to avoid mutation and init children
		const teamsWithChildren: TeamMember[] = teams.map((t) => ({ ...t, children: [] }));

		teamsWithChildren.forEach((t) => {
			teamMap.set(t.id, t);
		});

		const rootNodes: TeamMember[] = [];

		teamsWithChildren.forEach((member) => {
			if (member.reportsTo) {
				const parent = teamMap.get(member.reportsTo);
				if (parent) {
					parent.children!.push(member);
				} else {
					rootNodes.push(member);
				}
			} else {
				rootNodes.push(member);
			}
		});

		return rootNodes;
	});
</script>

{#snippet treeNode(node: TeamMember)}
	<div class="flex w-full flex-col md:w-auto md:items-center">
		<div
			class="relative z-10 flex w-full flex-row items-center gap-2 rounded-xl bg-white p-2 shadow-sm ring-1 ring-gray-200 transition-all hover:scale-105 hover:shadow-md md:w-max md:min-w-28 md:flex-col md:gap-1 md:p-1.5 dark:bg-slate-900 dark:ring-gray-700"
		>
			<img
				class="size-8 shrink-0 rounded-full object-cover md:size-10"
				src={node.image || 'https://ui-avatars.com/api/?name=' + node.name}
				alt={node.name}
			/>
			<div class="mt-0 w-full min-w-0 flex-1 text-left md:mt-1.5 md:text-center">
				<div
					class="text-xs leading-tight font-bold wrap-break-word text-gray-900 md:text-[11px] dark:text-white"
				>
					{node.name}
				</div>
				<div
					class="mt-0.5 text-[10px] font-semibold wrap-break-word text-blue-600 md:text-[9px] dark:text-blue-400"
				>
					{node.position}
				</div>
			</div>
		</div>

		{#if node.children && node.children.length > 0}
			<!-- Desktop: Vertical Line Down -->
			<div class="hidden h-5 w-px bg-gray-300 md:block dark:bg-gray-600"></div>

			<!-- Mobile: Vertical Stub from parent to children -->
			<div class="relative left-7 h-4 w-px bg-gray-300 md:hidden dark:bg-gray-600"></div>

			<!-- Children Container -->
			<!-- Mobile: padding left. Desktop: padding top, padding left 0. -->
			<div
				class="relative flex w-full flex-col gap-2 pt-0 pb-2 pl-6 md:w-auto md:flex-row md:gap-2 md:pt-3 md:pb-0 md:pl-0"
			>
				<!-- Desktop: Horizontal Bar for Children -->
				{#if node.children.length > 1}
					<div
						class="absolute top-0 right-0 left-0 mx-auto hidden h-px bg-gray-300 md:block dark:bg-gray-600"
						style="width: calc(100% - 4rem);"
					></div>
				{/if}

				{#each node.children as child, i (child.id)}
					<div class="relative flex w-full flex-col md:w-auto md:items-center">
						{#if node.children.length > 1}
							<!-- Desktop: Vertical Line Up from Child -->
							<div
								class="absolute -top-4 left-1/2 hidden h-4 w-px -translate-x-1/2 bg-gray-300 md:block dark:bg-gray-600"
							></div>
						{/if}

						<!-- Mobile: Vertical Timeline Line connecting children -->
						<div
							class="absolute top-0 -left-4 w-px bg-gray-300 md:hidden dark:bg-gray-600 {i ===
							node.children.length - 1
								? 'h-5'
								: 'h-[calc(100%+0.75rem)]'}"
						></div>

						<!-- Mobile: Horizontal branch connecting timeline to child card -->
						<div
							class="absolute top-5 -left-4 h-px w-4 bg-gray-300 md:hidden dark:bg-gray-600"
						></div>

						{@render treeNode(child)}
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

<section class="bg-slate-50 py-24 font-mono dark:bg-slate-800" id="struktur-organisasi">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:mx-0">
			<h2 class="text-3xl font-semibold tracking-tight text-blue-900 sm:text-4xl dark:text-white">
				Struktur Organisasi
			</h2>
			<p class="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
				Susunan organisasi dan tim kami yang siap melayani kebutuhan Anda.
			</p>
		</div>

		<div class="mt-16 overflow-x-auto pb-12">
			<div
				class="flex flex-col gap-8 px-4 md:min-w-max md:flex-row md:justify-center md:gap-3 md:px-0"
			>
				{#each root as node (node.id)}
					{@render treeNode(node)}
				{/each}
			</div>
		</div>
	</div>
</section>
