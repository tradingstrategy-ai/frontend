import postcssPresetEnv from 'postcss-preset-env';
import postcssGlobalData from '@csstools/postcss-global-data';

export default {
	plugins: [
		postcssGlobalData({
			files: ['./src/lib/components/css/breakpoints.css']
		}),
		postcssPresetEnv()
	]
};
