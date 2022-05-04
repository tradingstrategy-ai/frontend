/**
 * Link two or more charts by using ChartIQ injection API. See:
 * https://documentation.chartiq.com/tutorial-Using%20the%20Injection%20API.html
 * and example:
 * https://jsfiddle.net/chartiq/tgj9bork/
 */
export default class ChartLinker {
  linked = new Map();

  add(chartEngine): void {
    const ref = chartEngine.append('draw', this.handleDraw.bind(this, chartEngine));
    this.linked.set(chartEngine, ref);
  }

  remove(chartEngine): boolean {
    chartEngine.removeInjection(this.linked.get(chartEngine));
    return this.linked.delete(chartEngine);
  }

  handleDraw(conductor): void {
    if (conductor.isFollowing || !conductor.chart?.dataSegment) return;

    for (const follower of this.linked.keys()) {
      if (follower === conductor || !follower.chart?.dataSegment) continue;
      follower.isFollowing = true;
      follower.micropixels = conductor.micropixels;
      follower.chart.scroll = conductor.chart.scroll;
      follower.setCandleWidth(conductor.layout.candleWidth);
      follower.draw();
      follower.isFollowing = false;
    }
  }
}
