import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import DataTableActions from './data-table-actions.svelte';
import type { Tag } from '$lib/types';
import type { IdSchema } from '$lib/schemas/destroy';
import type { TagSchema } from '$lib/schemas/tag';
import type { SuperValidated, Infer } from 'sveltekit-superforms';
import ColumnHeader from '$lib/components/table/column-header.svelte';

export function createColumns(
	formDestroy: SuperValidated<Infer<IdSchema>>,
	formEdit: SuperValidated<Infer<TagSchema>>
): ColumnDef<Tag>[] {
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
					title: 'Tag Name'
				});
			}
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, {
					tag: row.original,
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
