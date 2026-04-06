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
		const labels = data.map((d: any) => d.category || 'Uncategorized');
		const values = data.map((d: any) => Number(d.amount));

		const { default: Chart } = await import('chart.js/auto');
		chart = new Chart(canvas, {
			type: 'doughnut',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Expenses',
						data: values,
						backgroundColor: [
							'rgba(255, 99, 132, 0.6)',
							'rgba(54, 162, 235, 0.6)',
							'rgba(255, 206, 86, 0.6)',
							'rgba(75, 192, 192, 0.6)',
							'rgba(153, 102, 255, 0.6)',
							'rgba(255, 159, 64, 0.6)'
						],
						borderWidth: 1
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'right'
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								let label = context.label || '';
								if (label) {
									label += ': ';
								}
								if (context.parsed !== null) {
									label += new Intl.NumberFormat('id-ID', {
										style: 'currency',
										currency: 'IDR'
									}).format(context.parsed);
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
