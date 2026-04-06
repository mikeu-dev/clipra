import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import DataTableActions from './data-table-actions.svelte';
import type { Stage } from '$lib/types';
import type { IdSchema } from '$lib/schemas/destroy';
import type { SuperValidated, Infer } from 'sveltekit-superforms';
import ColumnHeader from '$lib/components/table/column-header.svelte';

export function createColumns(formDestroy: SuperValidated<Infer<IdSchema>>): ColumnDef<Stage>[] {
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
			accessorKey: 'userName',
			cell: ({ row }) => {
				const name = row.original.userName ?? '--';
				return name;
			},
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'User'
				});
			}
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
			accessorKey: 'createdAt',
			cell: ({ row }) => {
				const date = new Date(row.original.createdAt as string | number | Date);
				return date.toLocaleDateString('en-EN', {
					day: '2-digit',
					month: 'long',
					year: 'numeric'
				});
			},
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Created At'
				});
			}
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, {
					id: row.original.id,
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
