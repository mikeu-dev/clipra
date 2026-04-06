import { db } from '$lib/server/database';
import {
	products,
	warehouses,
	locations,
	stockMoves,
	stockQuants
} from '$lib/server/database/schemas/inventory';
import { eq, and, desc, sql } from 'drizzle-orm';
import type {
	NewProduct,
	Product,
	NewWarehouse,
	Warehouse,
	NewLocation,
	Location,
	NewStockMove,
	StockMove
} from '$lib/server/database/schemas/inventory';
import { productCategories } from '$lib/server/database/schemas/inventory/products';
import { accounts } from '$lib/server/database/schemas/accounting';
import { aliasedTable } from 'drizzle-orm';

export class InventoryRepository {
	// --- Products ---
	async createProduct(data: NewProduct): Promise<Product> {
		await db.insert(products).values(data);
		const result = await db.select().from(products).where(eq(products.id, data.id)).limit(1);
		return result[0];
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async getProducts(companyId: string): Promise<any[]> {
		const incomeAcc = aliasedTable(accounts, 'incomeAcc');
		const expenseAcc = aliasedTable(accounts, 'expenseAcc');

		const rows = await db
			.select({
				product: products,
				category: productCategories,
				incomeAccount: incomeAcc,
				expenseAccount: expenseAcc
			})
			.from(products)
			.leftJoin(productCategories, eq(products.categoryId, productCategories.id))
			.leftJoin(incomeAcc, eq(products.incomeAccountId, incomeAcc.id))
			.leftJoin(expenseAcc, eq(products.expenseAccountId, expenseAcc.id))
			.where(eq(products.companyId, companyId));

		return rows.map((r) => ({
			...r.product,
			category: r.category,
			incomeAccount: r.incomeAccount,
			expenseAccount: r.expenseAccount
		}));
	}

	// --- Warehouses & Locations ---
	async createWarehouse(data: NewWarehouse): Promise<Warehouse> {
		await db.insert(warehouses).values(data);
		const result = await db.select().from(warehouses).where(eq(warehouses.id, data.id)).limit(1);
		return result[0];
	}

	async createLocation(data: NewLocation): Promise<Location> {
		await db.insert(locations).values(data);
		const result = await db.select().from(locations).where(eq(locations.id, data.id)).limit(1);
		return result[0];
	}

	async getLocations(companyId: string): Promise<Location[]> {
		return await db.select().from(locations).where(eq(locations.companyId, companyId));
	}

	async getWarehouses(companyId: string): Promise<Warehouse[]> {
		return await db.select().from(warehouses).where(eq(warehouses.companyId, companyId));
	}

	async getWarehouse(id: string): Promise<Warehouse | undefined> {
		const result = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1);
		return result[0];
	}

	async updateWarehouse(id: string, data: Partial<NewWarehouse>): Promise<void> {
		await db.update(warehouses).set(data).where(eq(warehouses.id, id));
	}

	async deleteWarehouse(id: string): Promise<void> {
		await db.delete(warehouses).where(eq(warehouses.id, id));
	}

	async getLocation(id: string): Promise<Location | undefined> {
		const result = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
		return result[0];
	}

	async updateLocation(id: string, data: Partial<NewLocation>): Promise<void> {
		await db.update(locations).set(data).where(eq(locations.id, id));
	}

	async deleteLocation(id: string): Promise<void> {
		await db.delete(locations).where(eq(locations.id, id));
	}

	// --- Stock Moves ---
	async createStockMove(data: NewStockMove): Promise<StockMove> {
		return await db.transaction(async (tx) => {
			await tx.insert(stockMoves).values(data);
			const result = await tx.select().from(stockMoves).where(eq(stockMoves.id, data.id)).limit(1);
			return result[0];
		});
	}

	async getStockMove(id: string): Promise<StockMove | undefined> {
		const result = await db.select().from(stockMoves).where(eq(stockMoves.id, id)).limit(1);
		return result[0];
	}

	async updateStockMoveState(id: string, state: StockMove['state']): Promise<void> {
		await db.update(stockMoves).set({ state }).where(eq(stockMoves.id, id));
	}

	async getStockMoveByReference(reference: string): Promise<StockMove[]> {
		return await db.select().from(stockMoves).where(eq(stockMoves.reference, reference));
	}

	// --- Stock Quants (Current Stock) ---
	async updateStockQuant(
		companyId: string,
		productId: string,
		locationId: string,
		deltaQty: number
	): Promise<void> {
		const existing = await db
			.select()
			.from(stockQuants)
			.where(and(eq(stockQuants.productId, productId), eq(stockQuants.locationId, locationId)))
			.limit(1);

		if (existing.length > 0) {
			await db
				.update(stockQuants)
				.set({
					quantity: sql`${stockQuants.quantity} + ${deltaQty}`,
					updatedAt: new Date()
				})
				.where(eq(stockQuants.id, existing[0].id));
		} else {
			await db.insert(stockQuants).values({
				id: crypto.randomUUID(),
				companyId,
				productId,
				locationId,
				quantity: deltaQty.toFixed(2)
			});
		}
	}

	async getQuantityOnHand(productId: string, locationId?: string): Promise<number> {
		const conditions = [eq(stockQuants.productId, productId)];
		if (locationId) {
			conditions.push(eq(stockQuants.locationId, locationId));
		}

		const result = await db
			.select({
				total: sql<number>`SUM(${stockQuants.quantity})`
			})
			.from(stockQuants)

			.where(and(...conditions));

		return result[0].total || 0;
	}

	async getStockMoves(companyId: string): Promise<
		(StockMove & {
			product: Product;
			sourceLocation: Location | null;
			destLocation: Location | null;
		})[]
	> {
		const sourceLoc = aliasedTable(locations, 'sourceLoc');
		const destLoc = aliasedTable(locations, 'destLoc');

		const rows = await db
			.select({
				move: stockMoves,
				product: products,
				sourceLocation: sourceLoc,
				destLocation: destLoc
			})
			.from(stockMoves)
			.leftJoin(products, eq(stockMoves.productId, products.id))
			.leftJoin(sourceLoc, eq(stockMoves.locationId, sourceLoc.id))
			.leftJoin(destLoc, eq(stockMoves.locationDestId, destLoc.id))
			.where(eq(stockMoves.companyId, companyId))
			.orderBy(desc(stockMoves.date));

		return rows.map((r) => ({
			...r.move,
			product: r.product!,
			sourceLocation: r.sourceLocation,
			destLocation: r.destLocation
		}));
	}

	async getProduct(id: string): Promise<Product | undefined> {
		const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
		return result[0];
	}

	async updateProduct(id: string, data: Partial<NewProduct>): Promise<void> {
		await db.update(products).set(data).where(eq(products.id, id));
	}
}
