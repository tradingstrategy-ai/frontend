/** @type {import('tailwindcss').Config} */
export default {
	content: [
		// Target only the files where LayerChart is used
		'./src/lib/charts/**/*.{html,js,svelte,ts}',
		'./node_modules/layerchart/**/*.{svelte,js}'
	],
	important: '.tailwind', // All styles will be scoped under this selector
	corePlugins: {
		// Disable Tailwind's global reset styles
		preflight: false
	},
	// Any theme extensions or plugins required by LayerChart would go here
	theme: {
		extend: {}
	},
	plugins: []
};
