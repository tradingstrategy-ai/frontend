/**
 * Link two or more charts by using ChartIQ injection API. See:
 * https://documentation.chartiq.com/tutorial-Using%20the%20Injection%20API.html
 * and example:
 * https://jsfiddle.net/chartiq/tgj9bork/
 */
export default class ChartLinker {
	linked = new Map();

	// register a ChartEngine instance with this linker (add various injections)
	add(chartEngine): void {
		const refs = [
			chartEngine.prepend('mousemoveinner', this.mousemoveinner.bind(this, chartEngine)),
			chartEngine.prepend('doDisplayCrosshairs', this.doDisplayCrosshairs.bind(this, chartEngine)),
			chartEngine.append('draw', this.draw.bind(this, chartEngine))
		];
		this.linked.set(chartEngine, refs);
	}

	// unregister - remove the injections
	remove(chartEngine): boolean {
		this.linked.get(chartEngine).forEach(chartEngine.removeInjection);
		return this.linked.delete(chartEngine);
	}

	// iterate over all registered ChartEngine instances that are not the
	// conductor (and flag them with isFollowing during the callback execution)
	eachFollower(conductor, callback): void {
		for (const follower of this.linked.keys()) {
			if (follower === conductor || !follower.chart?.dataSegment) continue;
			follower.isFollowing = true;
			callback(follower);
			follower.isFollowing = false;
		}
	}

	// inject draw method - detects zoom/scroll changes on the conductor and
	// mirrors the changes to all followers
	draw(conductor, params): void {
		// using params to determine whether `isFollowing = true` because:
		// (a) draw method accepts optional params (other injection methods don't)
		// (b) follower operations are invokded asynchronously, so we can't count
		//     on the state of conductor.isFollowing
		if (params?.isFollowing || !conductor.chart?.dataSegment) return;

		this.eachFollower(conductor, (follower) => {
			// Performance optimiation: draw is invoked on animation loop; handle
			// potentially costly operations asynchronously (on event loop) to
			// prevent page jank. See:
			// https://documentation.chartiq.com/tutorial-Using%20the%20Injection%20API.html#toc13__anchor
			// https://documentation.chartiq.com/CIQ.ChartEngine.html#draw__anchor
			setTimeout(() => {
				follower.micropixels = conductor.micropixels;
				follower.chart.scroll = conductor.chart.scroll;
				follower.setCandleWidth(conductor.layout.candleWidth);
				follower.draw({ isFollowing: true });
			});
		});
	}

	// inject mousemoveinner method - detect crosshair position on conductor and
	// mirror to all followers
	mousemoveinner(conductor): void {
		if (conductor.isFollowing || !conductor.chart?.dataSegment) return;

		this.eachFollower(conductor, (follower) => {
			// mirror mouse position on followers
			follower.mousemoveinner(conductor.cx + follower.left, conductor.cy + follower.top);
			// hide crosshairs and cooresponding price/date labels
			follower.controls.crossX.style.display = 'none';
			follower.controls.floatDate.style.display = 'none';
			follower.controls.crossY.style.display = 'none';
			follower.chart.yAxis.drawPriceLabels = false;
		});
	}

	// inject doDisplayCrosshairs - used in conjunction with mousemoveinner so
	// can display only the vertical crosshair on followers (doesn't makes sense
	// to show horizontal b/c different Y-Axis scale)
	doDisplayCrosshairs(conductor) {
		if (conductor.isFollowing || !conductor.chart?.dataSegment) return;

		// reset values that may have been hidden as a follower
		conductor.controls.crossX.style.display = '';
		conductor.controls.floatDate.style.display = '';
		conductor.controls.crossY.style.display = '';
		conductor.chart.yAxis.drawPriceLabels = true;

		this.eachFollower(conductor, (follower) => {
			// show vertical crosshair and date label if conductor crosshairs shown
			follower.controls.crossX.style.display = '';
			follower.controls.floatDate.style.display = '';
		});
	}
}
