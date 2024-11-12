import { readable } from 'svelte/store';

export type ClickableRowProps = {
	clickable: { id: string };
};

export default function ({ id }: { id: string }) {
	return () => {
		return {
			pluginState: {},
			hooks: {
				'tbody.tr': () => ({ props: readable({ id }) })
			}
		};
	};
}
