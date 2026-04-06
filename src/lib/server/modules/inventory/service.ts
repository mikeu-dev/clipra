import { InventoryRepository } from './repository';
import type {
	NewStockMove,
	NewProduct,
	NewWarehouse,
	NewLocation
} from '$lib/server/database/schemas/inventory';
import { v4 as uuidv4 } from 'uuid';
import { db } from '$lib/server/database';

export class InventoryService {
	private repo: InventoryRepository;

	constructor() {
		this.repo = new InventoryRepository();
	}

	async processStockMove(data: Omit<NewStockMove, 'id' | 'createdAt' | 'date'>) {
		// 1. Create Move Record
		const moveData: NewStockMove = {
			...data,
			id: uuidv4(),
			date: new Date(),
			state: data.state || 'draft'
		};

		const move = await this.repo.createStockMove(moveData);

		// 2. Update Quants ONLY if state is 'done'
		if (moveData.state === 'done') {
			// Decrease source
			await this.repo.updateStockQuant(
				data.companyId,
				data.productId,
				data.locationId,
				-Number(data.quantity)
			);

			// Increase dest
			await this.repo.updateStockQuant(
				data.companyId,
				data.productId,
				data.locationDestId,
				Number(data.quantity)
			);
		}

		return move;
	}

	async completeStockMove(moveId: string) {
		const move = await this.repo.getStockMove(moveId);
		if (!move || move.state === 'done') return;

		await db.transaction(async () => {
			// Update state
			await this.repo.updateStockMoveState(moveId, 'done');

			// Update Quants
			await this.repo.updateStockQuant(
				move.companyId,
				move.productId,
				move.locationId,
				-Number(move.quantity)
			);

			await this.repo.updateStockQuant(
				move.companyId,
				move.productId,
				move.locationDestId,
				Number(move.quantity)
			);
		});
	}

	async getStockLevel(productId: string) {
		return await this.repo.getQuantityOnHand(productId);
	}

	async getProducts(companyId: string) {
		return await this.repo.getProducts(companyId);
	}

	async getStockMoves(companyId: string) {
		return await this.repo.getStockMoves(companyId);
	}

	async getProduct(id: string) {
		return await this.repo.getProduct(id);
	}

	async handleProductImage(imageName: string | undefined | null): Promise<string | null> {
		if (!imageName) return null;
		if (imageName.startsWith('/uploads/')) return imageName;

		const fs = await import('node:fs');
		const path = await import('node:path');
		const cwd = process.cwd();
		const tmpPath = path.join(cwd, 'static/tmp', imageName);
		const uploadPath = path.join(cwd, 'static/uploads/products');

		if (fs.existsSync(tmpPath)) {
			if (!fs.existsSync(uploadPath)) {
				fs.mkdirSync(uploadPath, { recursive: true });
			}
			const finalPath = path.join(uploadPath, imageName);
			fs.renameSync(tmpPath, finalPath);
			return `/uploads/products/${imageName}`;
		}

		return null;
	}

	async createProduct(data: NewProduct & { image?: string | null }) {
		const processedImage = await this.handleProductImage(data.image);
		return await this.repo.createProduct({
			...data,
			image: processedImage
		});
	}

	async updateProduct(id: string, data: Partial<NewProduct> & { image?: string | null }) {
		if (data.image) {
			data.image = await this.handleProductImage(data.image);
		}
		return await this.repo.updateProduct(id, data);
	}

	async getLocations(companyId: string) {
		return await this.repo.getLocations(companyId);
	}

	async getWarehouses(companyId: string) {
		return await this.repo.getWarehouses(companyId);
	}

	async createWarehouse(data: NewWarehouse) {
		return await this.repo.createWarehouse(data);
	}

	async getWarehouse(id: string) {
		return await this.repo.getWarehouse(id);
	}

	async updateWarehouse(id: string, data: Partial<NewWarehouse>) {
		return await this.repo.updateWarehouse(id, data);
	}

	async deleteWarehouse(id: string) {
		return await this.repo.deleteWarehouse(id);
	}

	async createLocation(data: NewLocation) {
		return await this.repo.createLocation(data);
	}

	async getLocation(id: string) {
		return await this.repo.getLocation(id);
	}

	async updateLocation(id: string, data: Partial<NewLocation>) {
		return await this.repo.updateLocation(id, data);
	}

	async deleteLocation(id: string) {
		return await this.repo.deleteLocation(id);
	}
}
