import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from './data-table-actions.svelte';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import type { SuperValidated, Infer } from 'sveltekit-superforms';
import type { IdSchema } from '$lib/schemas/destroy';
import type { ReligionSchema } from '$lib/schemas/religion';

import type { Religion } from '$lib/types';

export const createColumns = (
	formDestroy: SuperValidated<Infer<IdSchema>>,
	formEdit: SuperValidated<Infer<ReligionSchema>>
): ColumnDef<Religion>[] => [
	{
		accessorKey: 'name',
		header: 'Religion Name'
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				religion: row.original,
				formDestroy,
				formEdit
			});
		}
	}
];
