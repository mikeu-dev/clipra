export function useSlug(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD') // pisahkan huruf dan diakritik (é → e +  ́)
		.replace(/[\u0300-\u036f]/g, '') // hapus diakritik
		.replace(/[^a-z0-9\s-]/g, '') // hapus karakter selain huruf, angka, spasi, dan dash
		.trim() // hapus spasi di awal/akhir
		.replace(/\s+/g, '-') // ganti spasi dengan dash
		.replace(/-+/g, '-'); // ganti dash berulang jadi satu
}
