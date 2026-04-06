import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from './data-table-actions.svelte';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import type { SuperValidated, Infer } from 'sveltekit-superforms';
import type { IdSchema } from '$lib/schemas/destroy';
import type { BankSchema } from '$lib/schemas/bank';

import type { Bank } from '$lib/types';

export const createColumns = (
	formDestroy: SuperValidated<Infer<IdSchema>>,
	formEdit: SuperValidated<Infer<BankSchema>>
): ColumnDef<Bank>[] => [
	{
		accessorKey: 'code',
		header: 'Code'
	},
	{
		accessorKey: 'name',
		header: 'Name'
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				bank: row.original,
				formDestroy,
				formEdit
			});
		}
	}
];
