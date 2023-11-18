import presetEnv from 'postcss-preset-env';
import globalData from '@csstools/postcss-global-data';
import darkThemeClass from 'postcss-dark-theme-class';

export default {
	plugins: [
		globalData({
			files: ['./src/lib/components/css/breakpoints.css']
		}),

		presetEnv(),

		darkThemeClass({
			darkSelector: '[data-color-mode="dark"]',
			lightSelector: '[data-color-mode="light"]',
			rootSelector: ['body']
		})
	]
};
