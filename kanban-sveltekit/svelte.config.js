// import adapter from '@sveltejs/adapter-auto';
// Cloudflare Pages adapter (for deployment)
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Using Cloudflare Pages adapter for deployment
		// To use adapter-auto instead, comment out the cloudflare import above and uncomment:
		// import adapter from '@sveltejs/adapter-auto';
		adapter: adapter(),
		experimental: {
			remoteFunctions: true,
		},
	},
	compilerOptions: {
		experimental: {
			async: true,
		},
	},
};

export default config;
