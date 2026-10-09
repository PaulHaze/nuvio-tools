import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	resolve: {
		alias: {
			// Same mapping as tsconfig's "@/*" so pages and tools import the same way in tests.
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'cloudflare:workers': fileURLToPath(
				new URL('./src/dev/cloudflare-workers.ts', import.meta.url)
			),
		},
	},
	test: {},
});
