import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	build: {
		cssCodeSplit: true,
		cssMinify: true,
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
