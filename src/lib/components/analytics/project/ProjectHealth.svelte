<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';

	interface ProjectStatItem {
		status: string;
		count: number;
	}

	interface DataProps {
		projectStatus: ProjectStatItem[];
		kpi: {
			totalProjects: number;
			completionRate: number;
			totalTasks: number;
		};
	}

	let { data }: { data: DataProps } = $props();

	let projectStats = $derived(data.projectStatus || []);
	let kpi = $derived(data.kpi || {});

	function getPercentage(status: string, collection: ProjectStatItem[], total: number) {
		const item = collection.find((i) => i.status === status);
		return item && total > 0 ? (Number(item.count) / total) * 100 : 0;
	}

	function getCount(status: string, collection: ProjectStatItem[]) {
		const item = collection.find((i) => i.status === status);
		return item ? Number(item.count) : 0;
	}
</script>

<div class="space-y-6">
	<!-- Project Status Overview -->
	<div class="space-y-2">
		<h4 class="text-sm leading-none font-medium">Project Status</h4>
		<div class="text-muted-foreground flex items-center justify-between text-xs">
			<span>Active ({getCount('active', projectStats)})</span>
			<span>Completed ({getCount('completed', projectStats)})</span>
		</div>
		<div class="bg-secondary flex h-2 w-full overflow-hidden rounded-full">
			<div
				class="bg-blue-500"
				style="width: {getPercentage('active', projectStats, kpi.totalProjects)}%"
			></div>
			<div
				class="bg-green-500"
				style="width: {getPercentage('completed', projectStats, kpi.totalProjects)}%"
			></div>
			<div
				class="bg-yellow-500"
				style="width: {getPercentage('on_hold', projectStats, kpi.totalProjects)}%"
			></div>
			<div
				class="bg-red-500"
				style="width: {getPercentage('cancelled', projectStats, kpi.totalProjects)}%"
			></div>
		</div>
		<div class="text-muted-foreground flex justify-end gap-2 text-xs">
			<div class="flex items-center gap-1">
				<div class="h-2 w-2 rounded-full bg-blue-500"></div>
				Active
			</div>
			<div class="flex items-center gap-1">
				<div class="h-2 w-2 rounded-full bg-green-500"></div>
				Completed
			</div>
			<div class="flex items-center gap-1">
				<div class="h-2 w-2 rounded-full bg-yellow-500"></div>
				On Hold
			</div>
		</div>
	</div>

	<!-- Task Completion Rate -->
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<h4 class="text-sm leading-none font-medium">Task Completion Rate</h4>
			<span class="text-sm font-bold">{Math.round(kpi.completionRate || 0)}%</span>
		</div>
		<Progress value={kpi.completionRate} class="h-2" />
		<p class="text-muted-foreground text-xs">
			{kpi.totalTasks} total tasks across all projects
		</p>
	</div>
</div>
