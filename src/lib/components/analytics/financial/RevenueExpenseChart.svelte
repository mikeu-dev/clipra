<script lang="ts">
	import { onMount } from 'svelte';

	/* eslint-disable @typescript-eslint/no-explicit-any */
	let { data }: { data: any } = $props();

	let canvas: HTMLCanvasElement;
	let chart: any;

	$effect(() => {
		if (chart) {
			chart.destroy();
		}
		if (canvas && data) {
			createChart();
		}
	});

	async function createChart() {
		const labels = [
			...new Set([
				...data.revenue.map((d: any) => d.date),
				...data.expenses.map((d: any) => d.date)
			])
		].sort();

		const revenueData = labels.map((date) => {
			const item = data.revenue.find((d: any) => d.date === date);
			return item ? Number(item.amount) : 0;
		});

		const expenseData = labels.map((date) => {
			const item = data.expenses.find((d: any) => d.date === date);
			return item ? Number(item.amount) : 0;
		});

		const { default: Chart } = await import('chart.js/auto');
		chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels: labels.map((d) => new Date(d).toLocaleDateString()),
				datasets: [
					{
						label: 'Revenue',
						data: revenueData,
						backgroundColor: 'rgba(34, 197, 94, 0.5)',
						borderColor: 'rgba(34, 197, 94, 1)',
						borderWidth: 1
					},
					{
						label: 'Expenses',
						data: expenseData,
						backgroundColor: 'rgba(239, 68, 68, 0.5)',
						borderColor: 'rgba(239, 68, 68, 1)',
						borderWidth: 1
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							callback: function (value) {
								return new Intl.NumberFormat('id-ID', {
									style: 'currency',
									currency: 'IDR',
									maximumSignificantDigits: 3
								}).format(value as number);
							}
						}
					}
				},
				plugins: {
					tooltip: {
						callbacks: {
							label: function (context) {
								let label = context.dataset.label || '';
								if (label) {
									label += ': ';
								}
								if (context.parsed.y !== null) {
									label += new Intl.NumberFormat('id-ID', {
										style: 'currency',
										currency: 'IDR'
									}).format(context.parsed.y);
								}
								return label;
							}
						}
					}
				}
			}
		});
	}

	onMount(() => {
		return () => {
			if (chart) chart.destroy();
		};
	});
</script>

<div class="relative h-full w-full">
	<canvas bind:this={canvas}></canvas>
</div>
