import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import DataTableActions from './data-table-actions.svelte';
import type { LeaveRequest } from '$lib/types';
import type { IdSchema } from '$lib/schemas/destroy';
import type { SuperValidated, Infer } from 'sveltekit-superforms';
import ColumnHeader from '$lib/components/table/column-header.svelte';
import StatusBadge from './status-badge.svelte';

export function createColumns(
	formDestroy: SuperValidated<Infer<IdSchema>>
): ColumnDef<LeaveRequest>[] {
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
			accessorKey: 'type',
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Type'
				});
			},
			cell: ({ row }) => {
				const type = row.original.type;
				return type.charAt(0).toUpperCase() + type.slice(1);
			}
		},
		{
			accessorKey: 'startDate',
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Start Date'
				});
			}
		},
		{
			accessorKey: 'endDate',
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'End Date'
				});
			}
		},
		{
			accessorKey: 'status',
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Status'
				});
			},
			cell: ({ row }) => {
				const status = row.original.status || 'pending';
				let variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'secondary';
				if (status === 'approved') variant = 'default';
				if (status === 'rejected') variant = 'destructive';
				if (status === 'pending') variant = 'outline';

				return renderComponent(StatusBadge, {
					variant,
					value: status
				});
			}
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, {
					id: row.original.id,
					status: row.original.status,
					formDestroy
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
