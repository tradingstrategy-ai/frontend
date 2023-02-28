import presetEnv from 'postcss-preset-env';

export default {
	plugins: [
		presetEnv({
			features: { 'nesting-rules': true }
		})
	]
};
