import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import DataTableActions from './data-table-actions.svelte';
import type { Unit } from '$lib/types';
import type { IdSchema } from '$lib/schemas/destroy';
import type { UnitSchema } from '$lib/schemas/unit';
import type { SuperValidated, Infer } from 'sveltekit-superforms';
import ColumnHeader from '$lib/components/table/column-header.svelte';

import type { User } from '$lib/types';

export function createColumns(
	formDestroy: SuperValidated<Infer<IdSchema>>,
	formEdit: SuperValidated<Infer<UnitSchema>>,
	users: User[]
): ColumnDef<Unit>[] {
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
			accessorKey: 'userName',
			cell: ({ row }) => {
				const user = row.original.user;
				return user ? user.name : '--';
			},
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'User'
				});
			}
		},
		{
			accessorKey: 'createdAt',
			cell: ({ row }) => {
				const date = new Date(row.original.createdAt as string | number | Date);
				return date.toLocaleDateString('id-ID', {
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
					unit: row.original,
					formDestroy,
					formEdit,
					users
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
