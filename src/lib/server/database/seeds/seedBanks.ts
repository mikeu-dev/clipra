import { BankService } from '../../../server/modules/bank/service';
import { banks as banksData } from '../../../config/app';
import { db } from '../index';

const bankService = new BankService();

export async function seedBanks() {
	console.log('Seeding banks...');
	for (const bank of banksData) {
		const existing = await db.query.banks.findFirst({
			where: (t, { eq }) => eq(t.code, bank.code)
		});
		if (!existing) {
			await bankService.create(bank);
		}
	}
}
