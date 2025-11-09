import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// Plugin to suppress CSS file output (similar to SolidStart approach)
// CSS is manually inlined in +layout.svelte for better mobile performance
function suppressCssOutput(): Plugin {
	return {
		name: 'suppress-css-output',
		enforce: 'post',
		generateBundle(_, bundle) {
			// Remove CSS files from bundle - they're manually inlined in layout
			const cssFiles = Object.keys(bundle).filter((fileName) => fileName.endsWith('.css'));
			cssFiles.forEach((fileName) => {
				delete bundle[fileName];
			});
		},
	};
}

export default defineConfig({
	plugins: [sveltekit(), tailwindcss(), suppressCssOutput()],
	build: {
		cssCodeSplit: false, // Bundle all CSS into one file for inlining
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
				// Aggressive manual chunking to reduce resource count for better mobile performance
				// Target: 6-7 chunks instead of 10 to minimize RTT overhead on slow networks
				manualChunks(id) {
					// Single vendor chunk for ALL node_modules
					// Reduces HTTP roundtrips at cost of slightly larger initial download
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
