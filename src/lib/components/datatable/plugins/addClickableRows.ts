import type { BodyRow } from 'svelte-headless-table';
import { readable } from 'svelte/store';

export default function ({ href }: { href: Function }) {
	return () => {
		return {
			pluginState: {},
			hooks: {
				'tbody.tr': (row: BodyRow<any, any>) => {
					return {
						props: readable({ href: href(row.original) })
					};
				}
			}
		};
	};
}
