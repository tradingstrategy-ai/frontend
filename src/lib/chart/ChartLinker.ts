/**
 * Link two or more charts by using ChartIQ injection API. See:
 * https://documentation.chartiq.com/tutorial-Using%20the%20Injection%20API.html
 * and example:
 * https://jsfiddle.net/chartiq/tgj9bork/
 */
export default class ChartLinker {
  linked = new Map();

  add(chartEngine): void {
    const refs = [
      chartEngine.prepend('mousemoveinner', this.mouseMove.bind(this, chartEngine)),
      chartEngine.prepend('doDisplayCrosshairs', this.displayCrosshairs.bind(this, chartEngine)),
      chartEngine.append('draw', this.draw.bind(this, chartEngine)),
    ];
    this.linked.set(chartEngine, refs);
  }

  remove(chartEngine): boolean {
    this.linked.get(chartEngine).forEach(chartEngine.removeInjection);
    return this.linked.delete(chartEngine);
  }

  eachFollower(conductor, callback): void {
    for (const follower of this.linked.keys()) {
      if (follower === conductor || !follower.chart?.dataSegment) continue;
      follower.isFollowing = true;
      callback(follower);
      follower.isFollowing = false;
    }
  }

  draw(conductor): void {
    if (conductor.isFollowing || !conductor.chart?.dataSegment) return;

    this.eachFollower(conductor, (follower) => {
      follower.micropixels = conductor.micropixels;
      follower.chart.scroll = conductor.chart.scroll;
      follower.setCandleWidth(conductor.layout.candleWidth);
      follower.draw();
    });
  }

  mouseMove(conductor): void {
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

  displayCrosshairs(conductor) {
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
