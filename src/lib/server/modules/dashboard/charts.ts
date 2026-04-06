// src/lib/server/modules/dashboard/charts.ts
import type { ChartConfiguration } from 'chart.js';

export interface ChartData {
	labels: string[];
	datasets: {
		label: string;
		data: number[];
		backgroundColor?: string | string[];
		borderColor?: string | string[];
		borderWidth?: number;
	}[];
}

/**
 * Color schemes untuk charts
 */
export const ChartColors = {
	primary: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
	success: ['#10b981', '#34d399', '#6ee7b7', '#d1fae5'],
	warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'],
	danger: ['#ef4444', '#f87171', '#fca5a5', '#fee2e2'],
	info: ['#06b6d4', '#22d3ee', '#67e8f9', '#cffafe'],
	purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'],
	gradient: [
		'rgba(59, 130, 246, 0.8)',
		'rgba(16, 185, 129, 0.8)',
		'rgba(245, 158, 11, 0.8)',
		'rgba(239, 68, 68, 0.8)',
		'rgba(139, 92, 246, 0.8)'
	]
};

/**
 * Format data untuk line chart (revenue trends, etc.)
 */
export function formatLineChartData(
	labels: string[],
	datasets: { label: string; data: number[]; color?: string }[]
): ChartData {
	return {
		labels,
		datasets: datasets.map((dataset, index) => ({
			label: dataset.label,
			data: dataset.data,
			borderColor: dataset.color || ChartColors.primary[index % ChartColors.primary.length],
			backgroundColor: dataset.color
				? `${dataset.color}20`
				: `${ChartColors.primary[index % ChartColors.primary.length]}20`,
			borderWidth: 2,
			tension: 0.4 // Smooth curves
		}))
	};
}

/**
 * Format data untuk bar chart (project completion, etc.)
 */
export function formatBarChartData(
	labels: string[],
	datasets: { label: string; data: number[]; color?: string }[]
): ChartData {
	return {
		labels,
		datasets: datasets.map((dataset, index) => ({
			label: dataset.label,
			data: dataset.data,
			backgroundColor: dataset.color || ChartColors.gradient[index % ChartColors.gradient.length],
			borderColor: dataset.color || ChartColors.primary[index % ChartColors.primary.length],
			borderWidth: 1
		}))
	};
}

/**
 * Format data untuk pie/doughnut chart (status distribution, etc.)
 */
export function formatPieChartData(labels: string[], data: number[]): ChartData {
	return {
		labels,
		datasets: [
			{
				label: 'Distribution',
				data,
				backgroundColor: ChartColors.gradient,
				borderColor: '#ffffff',
				borderWidth: 2
			}
		]
	};
}

/**
 * Default chart options
 */
export const defaultChartOptions: Partial<ChartConfiguration['options']> = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			position: 'bottom',
			labels: {
				padding: 15,
				font: {
					size: 12
				}
			}
		},
		tooltip: {
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			padding: 12,
			titleFont: {
				size: 14
			},
			bodyFont: {
				size: 13
			},
			cornerRadius: 8
		}
	}
};

/**
 * Line chart specific options
 */
export const lineChartOptions: Partial<ChartConfiguration['options']> = {
	...defaultChartOptions,
	scales: {
		y: {
			beginAtZero: true,
			grid: {
				color: 'rgba(0, 0, 0, 0.05)'
			}
		},
		x: {
			grid: {
				display: false
			}
		}
	}
};

/**
 * Bar chart specific options
 */
export const barChartOptions: Partial<ChartConfiguration['options']> = {
	...defaultChartOptions,
	scales: {
		y: {
			beginAtZero: true,
			grid: {
				color: 'rgba(0, 0, 0, 0.05)'
			}
		},
		x: {
			grid: {
				display: false
			}
		}
	}
};

/**
 * Pie/Doughnut chart specific options
 */
export const pieChartOptions: Partial<ChartConfiguration['options']> = {
	...defaultChartOptions,
	plugins: {
		...defaultChartOptions.plugins,
		legend: {
			position: 'right',
			labels: {
				padding: 15,
				font: {
					size: 12
				},
				usePointStyle: true
			}
		}
	}
};
