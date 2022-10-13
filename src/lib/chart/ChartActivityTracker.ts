import { trackActivity } from '$lib/activity';

const SCROLL_THRESHOLD = 50;

/**
 * Track chart activity when the user interacts with the chart.
 * - interactions include: scolling (beyond threshold), zooming, changing periodicity
 * - zooming causes a change in scroll value, so we don't have to detect it separately
 * - tracking stops after first interaction is detected / tracked
 */
export default class ChartActivityTracker {
	chartEngine: any;
	initialScroll: number;
	listeners: any[] = [];

	constructor(chartEngine: any) {
		this.chartEngine = chartEngine;
		this.initialScroll = this.chartEngine.chart.scroll;
		this.addEventListeners();
	}

	addEventListeners() {
		let listener = this.chartEngine.addEventListener('scroll', () => {
			if (this.scrolledPastThreshold()) {
				this.track();
			}
		});
		this.listeners.push(listener);

		listener = this.chartEngine.addEventListener('periodicity', ({ prevPeriodicity }) => {
			if (this.periodicityChanged(prevPeriodicity)) {
				this.track();
			}
		});
		this.listeners.push(listener);
	}

	removeEventListeners() {
		while (this.listeners.length) {
			this.chartEngine.removeEventListener(this.listeners.pop());
		}
	}

	scrolledPastThreshold() {
		return Math.abs(this.initialScroll - this.chartEngine.chart.scroll) > SCROLL_THRESHOLD;
	}

	periodicityChanged(prev) {
		const { period, interval, timeUnit } = this.chartEngine.getPeriodicity();
		return !(prev.periodicity === period && prev.interval === interval && prev.timeUnit === timeUnit);
	}

	track() {
		trackActivity('chart');
		this.removeEventListeners();
	}
}
