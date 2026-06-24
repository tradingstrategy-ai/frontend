import echartsScriptAssetUrl from 'echarts/dist/echarts.min.js?url';

const ECHARTS_SCRIPT_ATTRIBUTE = 'data-echarts-runtime';

export const ECHARTS_PACKAGE_VERSION = '5.6.0';

/**
 * Resolve the first-party ECharts browser bundle location.
 *
 * Keep this as the single URL decision point so we can move the bundle to
 * another asset host or route without touching chart components.
 */
export function resolveEChartsScriptUrl(): string {
	return echartsScriptAssetUrl;
}

export interface EChartsClickParams {
	data?: {
		url?: string;
	} | null;
}

export interface EChartsInstance {
	setOption(option: unknown): void;
	resize(): void;
	dispose(): void;
	on(eventName: 'click', handler: (params: EChartsClickParams) => void): void;
	off(eventName?: string): void;
}

export interface EChartsStatic {
	init(element: HTMLDivElement): EChartsInstance;
	getInstanceByDom(element: HTMLDivElement): EChartsInstance | undefined;
	graphic: {
		LinearGradient: new (
			x: number,
			y: number,
			x2: number,
			y2: number,
			colorStops: Array<{ offset: number; color: string }>
		) => unknown;
	};
}

let echartsPromise: Promise<EChartsStatic> | null = null;

function getWindowECharts(): EChartsStatic | undefined {
	return (window as Window & { echarts?: EChartsStatic }).echarts;
}

export async function loadECharts(): Promise<EChartsStatic> {
	const existingApi = getWindowECharts();
	if (existingApi) return existingApi;
	if (echartsPromise) return echartsPromise;

	echartsPromise = new Promise<EChartsStatic>((resolvePromise, rejectPromise) => {
		const scriptUrl = resolveEChartsScriptUrl();
		const existingScript = document.querySelector<HTMLScriptElement>(`script[${ECHARTS_SCRIPT_ATTRIBUTE}]`);

		const handleLoad = () => {
			const loadedApi = getWindowECharts();
			if (loadedApi) {
				resolvePromise(loadedApi);
				return;
			}

			rejectPromise(new Error('ECharts loaded but no global API was exposed.'));
		};

		if (existingScript) {
			const loadedApi = getWindowECharts();
			if (loadedApi) {
				resolvePromise(loadedApi);
				return;
			}

			existingScript.addEventListener('load', handleLoad, { once: true });
			existingScript.addEventListener('error', () => rejectPromise(new Error('Failed to load ECharts.')), {
				once: true
			});
			return;
		}

		const script = document.createElement('script');
		script.src = scriptUrl;
		script.async = true;
		script.setAttribute(ECHARTS_SCRIPT_ATTRIBUTE, 'true');
		script.referrerPolicy = 'no-referrer';
		script.addEventListener('load', handleLoad, { once: true });
		script.addEventListener('error', () => rejectPromise(new Error('Failed to load ECharts.')), {
			once: true
		});
		document.head.append(script);
	});

	return echartsPromise;
}
