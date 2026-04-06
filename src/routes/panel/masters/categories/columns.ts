import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableActions from './data-table-actions.svelte';
import ColumnHeader from '$lib/components/table/column-header.svelte';
import type { Category } from '$lib/server/database/schemas';
import NameCell from './name-cell.svelte';
import TypeCell from './type-cell.svelte';

export const columns: ColumnDef<Category>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => renderComponent(ColumnHeader, { column, title: 'Name' }),
		cell: ({ row }) => {
			const depth = (row.original as { depth?: number }).depth || 0;
			const name = row.getValue('name') as string;
			return renderComponent(NameCell, { depth, name });
		}
	},
	{
		accessorKey: 'type',
		header: ({ column }) => renderComponent(ColumnHeader, { column, title: 'Type' }),
		cell: ({ row }) => {
			const type = row.getValue('type') as string;
			return renderComponent(TypeCell, { type });
		}
	},
	{
		accessorKey: 'description',
		header: ({ column }) => renderComponent(ColumnHeader, { column, title: 'Description' })
	},
	{
		id: 'actions',
		header: ({ column }) => renderComponent(ColumnHeader, { column, title: 'Actions' }),
		cell: ({ row }) => renderComponent(DataTableActions, { category: row.original })
	}
];
