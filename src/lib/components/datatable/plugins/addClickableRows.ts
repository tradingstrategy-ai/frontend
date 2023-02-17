import type { BodyRow } from 'svelte-headless-table';
import { readable } from 'svelte/store';

export default function ({ id }: { id: string }) {
	return () => {
		return {
			pluginState: {},
			hooks: {
				'tbody.tr': (row: BodyRow<any, any>) => {
					return {
						props: readable({ id })
					};
				}
			}
		};
	};
}
