import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import DataTableAction from './data-table-actions.svelte';
import type { SuperValidated, Infer } from 'sveltekit-superforms';
import type { DestroySchema } from '$lib/schemas/user/destroy';
import type { ResetSchema } from '$lib/schemas/user/reset';
import type { RoleSchema } from '$lib/schemas/user/role';
import ColumnHeader from '$lib/components/table/column-header.svelte';
import { format } from 'date-fns';

export type AllUser = {
	id: string;
	email: string;
	name: string;
	createdAt: Date | null;
	updatedAt: Date | null;
	emailVerified: boolean;
	role: { name: string; level: string } | null;
	roleId: string;
};

export const createColumns = (
	formDestroy: SuperValidated<Infer<DestroySchema>>,
	formReset: SuperValidated<Infer<ResetSchema>>,
	formRole: SuperValidated<Infer<RoleSchema>>,
	roles: { id: string; name: string }[],
	executorLevel: string
): ColumnDef<AllUser>[] => [
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
		accessorKey: 'email',
		header: ({ column }) => {
			return renderComponent(ColumnHeader, {
				column,
				title: 'Email'
			});
		}
	},
	{
		id: 'role',
		header: ({ column }) => {
			return renderComponent(ColumnHeader, {
				column,
				title: 'Role'
			});
		},
		cell: ({ row }) => row.original.role?.name || '-'
	},
	{
		accessorKey: 'createdAt',
		cell: ({ row }) => {
			if (!row.original.createdAt) return '-';
			return format(new Date(row.original.createdAt), 'dd MMMM yyyy');
		},
		header: ({ column }) => {
			return renderComponent(ColumnHeader, {
				column,
				title: 'Created At'
			});
		}
	},
	{
		accessorKey: 'updatedAt',
		cell: ({ row }) => {
			if (!row.original.updatedAt) return '-';
			return format(new Date(row.original.updatedAt), 'dd MMMM yyyy');
		},
		header: ({ column }) => {
			return renderComponent(ColumnHeader, {
				column,
				title: 'Updated At'
			});
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableAction, {
				id: row.original.id,
				name: row.original.name,
				formDestroy,
				formReset,
				formRole,
				roles,
				roleId: row.original.roleId,
				roleLevel: (row.original.role && row.original.role.level) || '50',
				executorLevel: executorLevel
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
