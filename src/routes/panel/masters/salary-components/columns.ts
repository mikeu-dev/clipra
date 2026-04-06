import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import DataTableActions from './data-table-actions.svelte';
import type { SalaryComponent } from '$lib/types';
import type { IdSchema } from '$lib/schemas/destroy';
import type { SalaryComponentSchema } from '$lib/schemas/salary-component';
import type { SuperValidated, Infer } from 'sveltekit-superforms';
import ColumnHeader from '$lib/components/table/column-header.svelte';
import BadgeCell from './badge-cell.svelte';

export function createColumns(
	formDestroy: SuperValidated<Infer<IdSchema>>,
	formEdit: SuperValidated<Infer<SalaryComponentSchema>>
): ColumnDef<SalaryComponent>[] {
	return [
		{
			id: 'select',
			header: ({ table }) =>
				renderComponent(Checkbox, {
					checked: table.getIsAllPageRowsSelected(),
					indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
					'aria-label': 'Select all'
				}),
			cell: ({ row }) =>
				renderComponent(Checkbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(!!value),
					'aria-label': 'Select row'
				}),
			enableSorting: false,
			enableHiding: false
		},
		{
			accessorKey: 'name',
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Name'
				});
			}
		},
		{
			accessorKey: 'type',
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Type'
				});
			},
			cell: ({ row }) => {
				return renderComponent(BadgeCell, {
					value: row.original.type
				});
			}
		},
		{
			accessorKey: 'calculationType',
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Calculation'
				});
			}
		},
		{
			accessorKey: 'defaultAmount',
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Default Amount'
				});
			},
			cell: ({ row }) => {
				const amount = row.original.defaultAmount;
				return amount
					? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
							Number(amount)
						)
					: '0';
			}
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, {
					component: row.original,
					formDestroy,
					formEdit
				});
			},
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Action'
				});
			}
		}
	];
}
