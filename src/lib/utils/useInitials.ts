export function useInitials(name: string): string {
	if (!name) return '';
	return name
		.split(' ')
		.map((word) => word[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}
