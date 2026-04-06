import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from './data-table-actions.svelte';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import type { SuperValidated, Infer } from 'sveltekit-superforms';
import type { IdSchema } from '$lib/schemas/destroy';
import type { RoleSchema } from '$lib/schemas/role';

import type { Role } from '$lib/types';

export const createColumns = (
	formDestroy: SuperValidated<Infer<IdSchema>>,
	formEdit: SuperValidated<Infer<RoleSchema>>
): ColumnDef<Role>[] => [
	{
		accessorKey: 'name',
		header: 'Role Name'
	},
	{
		accessorKey: 'description',
		header: 'Description'
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				role: row.original,
				formDestroy,
				formEdit
			});
		}
	}
];
