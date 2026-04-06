// svelte.config.ts
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	onwarn: (warning, handler) => {
		if (warning.code === 'state_referenced_locally') return;
		if (warning.code === 'CIRCULAR_DEPENDENCY') return;
		handler(warning);
	},
	kit: {
		adapter: adapter()
	}
};

export default config;
