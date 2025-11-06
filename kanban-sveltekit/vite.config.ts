import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	build: {
		cssCodeSplit: false, // Bundle all CSS into one file for inlining
		cssMinify: true,
		assetsInlineLimit: 100000, // Inline CSS files smaller than 100KB
		rollupOptions: {
			output: {
				manualChunks: undefined,
			},
		},
	},
	preview: {
		port: 3005
	}
});
