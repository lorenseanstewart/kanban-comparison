import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	build: {
		// Note: cssCodeSplit removed as SvelteKit manages CSS bundling
		cssMinify: true,
		assetsInlineLimit: 100000, // Inline CSS files smaller than 100KB
		minify: 'terser', // Use terser for better minification
		terserOptions: {
			compress: {
				drop_console: true, // Remove console.log in production
				drop_debugger: true, // Remove debugger statements
			},
		},
		rollupOptions: {
			treeshake: {
				preset: 'recommended', // Enable aggressive tree-shaking
			},
			output: {
				// Manual chunking to organize code for better caching and parallel loading
				// Measurements show this performs better on 3G than a single bundle
				manualChunks(id) {
					// Single vendor chunk for ALL node_modules
					if (id.includes('node_modules')) {
						return 'vendor';
					}
					// Combine all app code into single chunk
					// Components + utilities + routes in one file
					if (id.includes('/lib/') || id.includes('/routes/')) {
						return 'app';
					}
				},
			},
		},
	},
	optimizeDeps: {
		esbuildOptions: {
			treeShaking: true, // Enable tree-shaking for dependencies
		},
	},
	preview: {
		port: 3005
	}
});
