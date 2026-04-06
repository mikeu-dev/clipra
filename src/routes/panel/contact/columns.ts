import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import DataTableActions from './data-table-actions.svelte';
import type { ContactMessage } from '$lib/types';
import type { IdSchema } from '$lib/schemas/destroy';
import type { SuperValidated, Infer } from 'sveltekit-superforms';
import IsReadCell from '$lib/components/table/is-read-cell.svelte';
import ColumnHeader from '$lib/components/table/column-header.svelte';
import IsRepliedCell from '$lib/components/table/is-replied-cell.svelte';

export function createColumns(
	formDestroy: SuperValidated<Infer<IdSchema>>
): ColumnDef<ContactMessage>[] {
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
			accessorKey: 'firstName',
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Name'
				});
			}
		},
		{
			accessorKey: 'company',
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Company'
				});
			}
		},
		{
			accessorKey: 'isRead',
			cell: ({ row }) =>
				renderComponent(IsReadCell, {
					isRead: row.original.isRead
				}),
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Status'
				});
			}
		},
		{
			accessorKey: 'isReplied',
			cell: ({ row }) =>
				renderComponent(IsRepliedCell, {
					isReplied: row.original.isReplied
				}),
			header: ({ column }) => {
				return renderComponent(ColumnHeader, {
					column,
					title: 'Replied'
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
					title: 'Receive At'
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
