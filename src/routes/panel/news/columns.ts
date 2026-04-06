import type { ColumnDef } from '@tanstack/table-core';
import type { News } from '$lib/server/database/schemas';
import DataTableActions from './data-table-actions.svelte';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import type { SuperValidated, Infer } from 'sveltekit-superforms';
import type { DestroySchema } from '$lib/schemas/news/destroy';

export const createColumns = (
	formDestroy: SuperValidated<Infer<DestroySchema>>
): ColumnDef<News>[] => [
	{
		accessorKey: 'title',
		header: 'Title'
	},
	{
		accessorKey: 'slug',
		header: 'Slug'
	},
	{
		accessorKey: 'type',
		header: 'Type',
		cell: ({ row }) => row.getValue('type') || '-'
	},
	{
		accessorKey: 'views',
		header: 'Views'
	},
	{
		accessorKey: 'published',
		header: 'Status',
		cell: ({ row }) => {
			return row.getValue('published') ? 'Published' : 'Draft';
		}
	},
	{
		accessorKey: 'createdAt',
		header: 'Created At',
		cell: ({ row }) => {
			const date = new Date(row.getValue('createdAt'));
			return date.toLocaleDateString();
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id,
				formDestroy
			});
		}
	}
];
