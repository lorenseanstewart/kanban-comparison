import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
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
				manualChunks: undefined,
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
