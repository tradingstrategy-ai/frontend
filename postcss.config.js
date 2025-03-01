import globalData from '@csstools/postcss-global-data';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import presetEnv from 'postcss-preset-env';
import darkThemeClass from 'postcss-dark-theme-class';

export default {
	plugins: [
		globalData({
			files: ['./src/lib/components/css/breakpoints.css']
		}),

		// Tailwind is a peer dependency of LayerChart (and tailwindcss has autoprefixer as a peer dep)
		tailwindcss(),
		autoprefixer(),

		presetEnv(),

		darkThemeClass({
			darkSelector: '[data-color-mode="dark"]',
			lightSelector: '[data-color-mode="light"]'
		})
	]
};
