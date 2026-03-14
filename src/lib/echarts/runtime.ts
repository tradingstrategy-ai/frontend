export const ECHARTS_CDN = 'https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js';

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
		const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${ECHARTS_CDN}"]`);

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
		script.src = ECHARTS_CDN;
		script.async = true;
		script.referrerPolicy = 'no-referrer';
		script.addEventListener('load', handleLoad, { once: true });
		script.addEventListener('error', () => rejectPromise(new Error('Failed to load ECharts from CDN.')), {
			once: true
		});
		document.head.append(script);
	});

	return echartsPromise;
}
