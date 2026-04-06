import type * as table from '$lib/server/database/schemas';
import type { IEmployeeService } from './interfaces/IEmployeeService';
import { EmployeeService as EmployeeServiceImpl } from './service';
import type { EmployeeResponseDTO } from './dto/employee-response.dto';
import { BaseController } from '$lib/server/core/base.controller';

import { UpdateEmployeeSchema } from './dto/update-employee.dto';
import { ZodError } from 'zod';
import { BadRequestException } from '$lib/server/core/exceptions';

export class EmployeeController extends BaseController<
	table.Employee,
	table.NewEmployee,
	EmployeeResponseDTO
> {
	protected override service: IEmployeeService;

	constructor(service: IEmployeeService = new EmployeeServiceImpl()) {
		super(service);
		this.service = service;
	}

	// Override generic create/update to add specific validation if needed,
	// although BaseController might be too generic depending on how it handles input parsing.
	// If BaseController just calls service.create(data), we might want to validate here.

	// Let's assume for now we use the methods provided by BaseController but we might need
	// to override create/update endpoints at the route level to parse Zod schemas.
	// Wait, the BaseController usually is used by the Route handler (Page Server Load/Actions).
	// The Route handler calls controller.create(rawData).

	// Let's implement specific validated methods if we want strict typing exposed

	async create(data: Omit<table.NewEmployee, 'id'>): Promise<EmployeeResponseDTO> {
		try {
			// If validation needed here, parse 'data'
			// const validated = CreateEmployeeSchema.parse(data);
			return await this.service.create(data);
		} catch (error) {
			if (error instanceof ZodError) {
				throw new BadRequestException('Invalid input data', error.flatten().fieldErrors);
			}
			throw error;
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async update(event: any, id: string): Promise<void> {
		try {
			const rawData = await event.request.json();
			const data = UpdateEmployeeSchema.parse(rawData);
			await this.service.update(id, data as unknown as Partial<table.NewEmployee>);
		} catch (error) {
			if (error instanceof ZodError) {
				throw new BadRequestException('Invalid input data', error.flatten().fieldErrors);
			}
			throw error;
		}
	}
}
