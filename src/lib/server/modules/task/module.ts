import { TaskService } from './service';
import { TaskRepository } from './repository';

export class TaskModule {
	private static instance: TaskModule;
	private service: TaskService;
	private repository: TaskRepository;

	private constructor() {
		this.repository = new TaskRepository();
		this.service = new TaskService(this.repository);
	}

	public static getInstance(): TaskModule {
		if (!TaskModule.instance) {
			TaskModule.instance = new TaskModule();
		}
		return TaskModule.instance;
	}

	public static getService(): TaskService {
		return TaskModule.getInstance().service;
	}

	public static getRepository(): TaskRepository {
		return TaskModule.getInstance().repository;
	}
}
